use starknet::ContractAddress;
use alexandria_storage::list::{List, ListTrait};

#[starknet::interface]
trait IRussianStarklette<TContractState> {
    fn start_game(ref self: TContractState) -> bool;
    fn place_bet(ref self: TContractState, bet_number: u128, bet_amount: u128) -> bool;
    fn update_bet_number(ref self: TContractState, bet_number: u128) -> bool;
    fn update_bet_amount(ref self: TContractState, bet_amount: u128) -> bool;
    fn end_game(self: @TContractState) -> bool;
}

#[starknet::contract]
mod RussianStarklette {
    use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::player_balance::InternalContractMemberStateTrait;
use starknet::{ContractAddress, get_caller_address, get_execution_info};
    use alexandria_storage::list::{List, ListTrait};
    use starknet::contract_address_try_from_felt252;
    use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;

    #[storage]
    struct Storage {
        game_id: u128,
        game_owner: ContractAddress,
        game_status: felt252,
        game_winning_number: u128,
        bets_detail: LegacyMap<ContractAddress, (u128, u128)>,
        game_handler_address: ContractAddress
    }

    #[constructor]
    fn constructor(ref self: ContractState, id: u128) {
        let caller_address: ContractAddress = get_caller_address();
        self.game_id.write(id);
        self.game_owner.write(caller_address);
        self.game_status.write('NOT_STARTED');
    }

    #[external(v0)]
    impl RussianStarklette of super::IRussianStarklette<ContractState> {
        fn start_game(ref self: ContractState) -> bool {
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            assert(caller_address==self.game_owner.read(), 'only owner can start the game');
            let current_state = self.game_status.read();
            if (current_state != 'NOT_STARTED') {
                return false;
            }
            self.game_status.write('ONGOING');
            true
        }
        fn place_bet(ref self: ContractState, bet_number: u128, bet_amount: u128) -> bool {
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            // add validation to check the balance
            let game_handler_state = RussianStarkletteDeployer::unsafe_new_contract_state();
            let player_current_balance = game_handler_state.player_balance.read(caller_address);
            assert(bet_amount>=player_current_balance, 'not enough balace');
            self.bets_detail.write(caller_address, (bet_number, bet_amount));
            true
        }
        fn update_bet_number(ref self: ContractState, bet_number: u128) -> bool {
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            let (current_bet_number, current_bet_amount) = self.bets_detail.read(caller_address);
            if (current_bet_amount == 0 ){
                return false;
            }
            self.bets_detail.write(caller_address, (bet_number, current_bet_amount));
            true
        }
        fn update_bet_amount(ref self: ContractState, bet_amount: u128) -> bool {
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            let game_handler_state = RussianStarkletteDeployer::unsafe_new_contract_state();
            let player_current_balance = game_handler_state.player_balance.read(caller_address);
            assert(bet_amount>=player_current_balance, 'not enough balace');

            let (current_bet_number, current_bet_amount) = self.bets_detail.read(caller_address);
            if (current_bet_number == 0 ){
                return false;
            }
            self.bets_detail.write(caller_address, (current_bet_number, bet_amount));
            true
        }
        fn end_game(self: @ContractState) -> bool {
            // owner only validation
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            assert(caller_address==self.game_owner.read(), 'only owner can start the game');
            // generate a random number
            // update the balance of the players
            let mut unsafe_state = RussianStarkletteDeployer::unsafe_new_contract_state();

            true
        }
    }
    

}
