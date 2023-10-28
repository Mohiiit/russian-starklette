use starknet::{ContractAddress, ClassHash};

#[starknet::interface]
trait IRussianStarkletteDeployer<TContractState> {
    fn new_game(ref self: TContractState, caller_address: ContractAddress ) ->  ContractAddress;
    fn get_owner(self: @TContractState, game_contract_address: ContractAddress) -> ContractAddress;
    fn get_game_id(self: @TContractState) -> u128;
    fn update_player_balance(ref self: TContractState, player_contract_address: ContractAddress, amount: u128);
    fn get_player_balance(self: @TContractState, player_contract_address: ContractAddress) -> u128;
}

#[starknet::contract]
mod RussianStarkletteDeployer {
    use starknet::{ContractAddress, get_caller_address,get_execution_info, ClassHash};
    use alexandria_storage::list::{List, ListTrait};
    use starknet::syscalls::deploy_syscall;
    use cairo_1_russian_roulette::game::RussianStarklette;
    use cairo_1_russian_roulette::game::IRussianStarklette;
    use cairo_1_russian_roulette::game::IRussianStarkletteDispatcher;
    
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
            let new_game_address = self._deploy_new_game();
            self._set_game_id();
            self._set_game_owner(new_game_address, caller_address);
            self._update_game_status('NOT_STARTED', new_game_address);
            new_game_address
        }

        fn get_owner(self: @ContractState, game_contract_address: ContractAddress) -> ContractAddress {
            self._get_game_owner(game_contract_address)
        }

        fn get_game_id(self: @ContractState) -> u128 {
            self._get_game_id()
        }

        fn update_player_balance(ref self: ContractState, player_contract_address: ContractAddress, amount: u128) {
            
        }
        fn get_player_balance(self: @ContractState, player_contract_address: ContractAddress) -> u128 {
            self._get_player_balance(player_contract_address)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _get_game_id(self: @ContractState) -> u128 {
            self.game_id.read()
        }
        fn _set_game_id(ref self: ContractState) {
            let current_game_id = self.game_id.read();
            self.game_id.write(current_game_id+1);
        }
        fn _get_game_owner(self: @ContractState, game_contract_address: ContractAddress) -> ContractAddress {
            self.game_owners.read(game_contract_address)
        }
        fn _set_game_owner(ref self: ContractState, game_contract_address: ContractAddress, caller_address: ContractAddress) {
            self.game_owners.write(game_contract_address, caller_address);
        }
        fn _update_game_status(ref self: ContractState, game_status: felt252, game_contract_address: ContractAddress) {
            let mut game_status_list: List<ContractAddress> = self.game_status.read(game_status);
            game_status_list.append(game_contract_address);
            self.game_status.write(game_status, game_status_list);
        }
        fn _get_player_balance(self: @ContractState, player_contract_address: ContractAddress) -> u128 {
            self.player_balance.read(player_contract_address)
        }
        fn _increase_player_balance(ref self: ContractState, player_contract_address: ContractAddress, amount: u128) {
            let player_current_balance = self.player_balance.read(player_contract_address);
            self.player_balance.write(player_contract_address, amount+player_current_balance);
        }
        fn _decrease_player_balance(ref self: ContractState, player_contract_address: ContractAddress, amount: u128) {
            let player_current_balance = self.player_balance.read(player_contract_address);
            if(amount>=player_current_balance) {
                self.player_balance.write(player_contract_address, 0);
            } else {
                self.player_balance.write(player_contract_address, player_current_balance-amount);
            }
        }
        fn _deploy_new_game(ref self: ContractState) -> ContractAddress {
            let game_id = self.game_id.read();
            let mut calldata = array![game_id.into()];
            let (new_game_address, _) = deploy_syscall(
                self.game_contract_hash.read(), 0, calldata.span(), false
            )
            .expect('failed to deploy counter');
            new_game_address
        }
    }
}
