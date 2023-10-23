use starknet::{ContractAddress, ClassHash};
use alexandria_storage::list::{List, ListTrait};
use super::game::RussianStarklette;

#[starknet::interface]
trait IRussianStarkletteDeployer<TContractState> {
    fn new_game(ref self: TContractState ) ->  ContractAddress;
}

#[starknet::contract]
mod RussianStarkletteDeployer {
    use starknet::{ContractAddress, get_caller_address,get_execution_info, ClassHash};
    use alexandria_storage::list::{List, ListTrait};
    use starknet::syscalls::deploy_syscall;
    use starknet::contract_address_to_felt252;
    use starknet::class_hash_to_felt252;
    use starknet::OptionTrait;
    use debug::PrintTrait;
    use cairo_1_russian_roulette::game::RussianStarklette;
    use cairo_1_russian_roulette::game::IRussianStarklette;
    use cairo_1_russian_roulette::game::IRussianStarkletteDispatcher;
    

    #[storage]
    struct Storage {
        game_id: u128,
        game_contract_hash: ClassHash,
        game_owners: LegacyMap<ContractAddress, ContractAddress>,
        game_status: LegacyMap<felt252, List<ContractAddress>>
    }

    #[constructor]
    fn constructor(ref self: ContractState, class_hash: ClassHash) {
        self.game_contract_hash.write(class_hash);
    }

    #[external(v0)]
    impl RussianStarkletteDeployer of super::IRussianStarkletteDeployer<ContractState>{
        
        fn new_game(ref self: ContractState) ->  ContractAddress{
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            let mut calldata = ArrayTrait::new();
            let caller_address_felt252 = contract_address_to_felt252(caller_address);
            let game_id_felt252: felt252 = self.game_id.read().into();
            calldata.append(caller_address_felt252);
            calldata.append(game_id_felt252);
            let (new_game_address, _) = deploy_syscall(
                self.game_contract_hash.read(), 0, calldata.span(), false
            )
            .expect('failed to deploy counter');
            self.game_owners.write(new_game_address, caller_address);
            let mut game_status_list: List<ContractAddress> = self.game_status.read('NOT_STARTED');
            game_status_list.append(new_game_address);
            self.game_status.write('NOT_STARTED', game_status_list);
            self.game_id.write(self.game_id.read()+1);
            let to_print = contract_address_to_felt252(new_game_address);
            to_print.print();
            new_game_address
        }
    }

}
