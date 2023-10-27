use starknet::{ContractAddress, ClassHash};
use alexandria_storage::list::{List, ListTrait};
use super::game::RussianStarklette;

#[starknet::interface]
trait IRussianStarkletteDeployer<TContractState> {
    fn new_game(ref self: TContractState, caller_address: ContractAddress ) ->  ContractAddress;
    fn get_owner(self: @TContractState, game_contract_address: ContractAddress) -> ContractAddress;
    fn get_game_id(self: @TContractState) -> u128;
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
    use starknet::class_hash_try_from_felt252;
    

    #[storage]
    struct Storage {
        game_id: u128,
        game_contract_hash: ClassHash,
        game_owners: LegacyMap<ContractAddress, ContractAddress>,
        game_status: LegacyMap<felt252, List<ContractAddress>>,
        player_balance: LegacyMap<ContractAddress, u128>  
    }

    #[constructor]
    fn constructor(ref self: ContractState, class_hash: ClassHash) {
        self.game_id.write(0);
        self.game_contract_hash.write(class_hash);
    }

    #[external(v0)]
    impl RussianStarkletteDeployer of super::IRussianStarkletteDeployer<ContractState>{
        
        fn new_game(ref self: ContractState, caller_address: ContractAddress) ->  ContractAddress{
            // let caller_address: ContractAddress = get_caller_address();
            let game_id = self.game_id.read();
            let mut calldata = ArrayTrait::new();
            game_id.serialize(ref calldata);
            let felt252_caller_address = contract_address_to_felt252(caller_address);
            felt252_caller_address.print();
            let (new_game_address, _) = deploy_syscall(
                self.game_contract_hash.read(), 0, calldata.span(), false
            )
            .expect('failed to deploy counter');
            self.game_owners.write(new_game_address, caller_address);
            let mut game_status_list: List<ContractAddress> = self.game_status.read('NOT_STARTED');
            game_status_list.append(new_game_address);
            self.game_status.write('NOT_STARTED', game_status_list);
            let current_game_id = self.game_id.read();
            self.game_id.write(current_game_id+1);
            let current_game_id = self.game_id.read();
            current_game_id.print();
            new_game_address
        }

        fn get_owner(self: @ContractState, game_contract_address: ContractAddress) -> ContractAddress {
            let response = self.game_owners.read(game_contract_address);
            let to_print = contract_address_to_felt252(response);
            response
        }

        fn get_game_id(self: @ContractState) -> u128 {
            self.game_id.read()
        }
    }

}
