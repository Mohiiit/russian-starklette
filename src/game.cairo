use starknet::ContractAddress;
use alexandria_storage::list::{List, ListTrait};
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;

#[starknet::interface]
trait IRussianStarklette<TContractState> {
    fn start_game(ref self: TContractState) -> bool;
    fn place_bet(
        ref self: TContractState,
        caller_address: ContractAddress,
        bet_number: u128,
        bet_amount: u128
    ) -> bool;
    fn update_bet_number(ref self: TContractState, bet_number: u128) -> bool;
    fn update_bet_amount(ref self: TContractState, bet_amount: u128) -> bool;
    fn end_game(self: @TContractState) -> bool;
    fn get_game_owner(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
mod RussianStarklette {
    use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
    use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
    use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{
        game_ownersContractMemberStateTrait, game_contract_hashContractMemberStateTrait,
        player_balanceContractMemberStateTrait
    };
    use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
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
    fn constructor(ref self: ContractState, id: u128, caller_address: ContractAddress, game_handler_address: ContractAddress) {
        // let caller_address: ContractAddress = get_caller_address();
        self.game_id.write(id);
        self.game_owner.write(caller_address);
        self.game_status.write('NOT_STARTED');
        self.game_handler_address.write(game_handler_address);
    }

    #[external(v0)]
    impl RussianStarklette of super::IRussianStarklette<ContractState> {
        fn get_game_owner(self: @ContractState) -> ContractAddress {
            self.game_owner.read()
        }
        fn start_game(ref self: ContractState) -> bool {
            let caller_address: ContractAddress = get_caller_address();
            assert(caller_address == self.game_owner.read(), 'only owner can start the game');
            let current_state = self.game_status.read();
            if (current_state != 'NOT_STARTED') {
                return false;
            }
            self.game_status.write('ONGOING');
            true
        }
        fn place_bet(
            ref self: ContractState,
            caller_address: ContractAddress,
            bet_number: u128,
            bet_amount: u128
        ) -> bool {
            let current_caller_address: ContractAddress = get_caller_address();
            assert(current_caller_address==caller_address, 'only player can place bet');
            assert(self.game_status.read()=='ONGOING', 'game not started yet');
            let game_handler = IRussianStarkletteDeployerDispatcher {
                contract_address: self.game_handler_address.read()
            };
            let player_current_balance = game_handler.get_player_balance(caller_address);
            assert(bet_amount <= player_current_balance, 'not enough balace');
            self.bets_detail.write(caller_address, (bet_number, bet_amount));
            game_handler.decrease_player_balance(caller_address, bet_amount);
            true
        }
        fn update_bet_number(ref self: ContractState, bet_number: u128) -> bool {
            assert(self.game_status.read()=='ONGOING', 'game not started yet');
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            let (current_bet_number, current_bet_amount) = self.bets_detail.read(caller_address);
            if (current_bet_amount == 0) {
                return false;
            }
            self.bets_detail.write(caller_address, (bet_number, current_bet_amount));
            true
        }
        fn update_bet_amount(ref self: ContractState, bet_amount: u128) -> bool {
            assert(self.game_status.read()=='ONGOING', 'game not started yet');
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            let game_handler = IRussianStarkletteDeployerDispatcher {
                contract_address: self.game_handler_address.read()
            };
            let player_current_balance = game_handler.get_player_balance(caller_address);

            let (current_bet_number, current_bet_amount) = self.bets_detail.read(caller_address);
            if (current_bet_number == 0) {
                return false;
            }
            if (current_bet_amount >= bet_amount) {
                self.bets_detail.write(caller_address, (current_bet_number, bet_amount));
                game_handler.increase_player_balance(caller_address, current_bet_amount-bet_amount);
                return true;
            } else {
                let balance_needed = bet_amount-current_bet_amount;
                assert(balance_needed <= player_current_balance, 'not enough balace');
                self.bets_detail.write(caller_address, (current_bet_number, bet_amount));
                game_handler.decrease_player_balance(caller_address, balance_needed);
                return true;
            }
            false
        }
        fn end_game(self: @ContractState) -> bool {
            assert(self.game_status.read()=='ONGOING', 'game not started yet');
            let caller_address: ContractAddress = get_execution_info().unbox().caller_address;
            assert(caller_address == self.game_owner.read(), 'only owner can start the game');
            // generate a random number
            // update the balance of the players
            let mut unsafe_state = RussianStarkletteDeployer::unsafe_new_contract_state();

            true
        }
    }
}
