use starknet::ContractAddress;
use alexandria_storage::list::{List, ListTrait};
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use RussianStarklette::Game;

#[starknet::interface]
trait IRussianStarklette<TContractState> {
    fn start_game(ref self: TContractState);
    fn place_bet(ref self: TContractState, bet_number: u128, bet_amount: u128);
    fn update_bet_number(ref self: TContractState, bet_number: u128);
    fn update_bet_amount(ref self: TContractState, bet_amount: u128);
    fn end_game(ref self: TContractState);
    fn get_game(self: @TContractState) -> Game;
}

#[starknet::contract]
mod RussianStarklette {
    use core::box::BoxTrait;
    use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
    use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
    use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{
        game_contract_hashContractMemberStateTrait, player_balanceContractMemberStateTrait
    };
    use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
    use starknet::{ContractAddress, get_caller_address, get_execution_info};
    use alexandria_storage::list::{List, ListTrait};
    use alexandria_data_structures::array_ext::ArrayTraitExt;
    use starknet::contract_address_try_from_felt252;
    use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
    use debug::PrintTrait;

    #[storage]
    struct Storage {
        game_id: u128,
        game_owner: ContractAddress,
        game_status: felt252,
        game_winning_number: u128,
        bets_detail: LegacyMap<ContractAddress, (u128, u128)>,
        players: List<ContractAddress>,
        game_handler_address: ContractAddress
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        GameStarted: GameStarted,
        GameEnded: GameEnded,
        BetUpdated: BetUpdated,
        BetPlaced: BetPlaced
    }

    #[derive(Drop, starknet::Event)]
    struct GameStarted {
        game_status: felt252,
        game_id: u128
    }
    #[derive(Drop, starknet::Event)]
    struct GameEnded {
        game_status: felt252,
        game_id: u128,
        game_winning_number: u128,
        winners: Array<Winner>
    }

    #[derive(Drop, starknet::Event)]
    struct BetUpdated {
        old_bet_amount: u128,
        old_bet_number: u128,
        new_bet_amount: u128,
        new_bet_number: u128,
        player: ContractAddress
    }
    #[derive(Drop, starknet::Event)]
    struct BetPlaced {
        amount: u128,
        number: u128,
        player: ContractAddress
    }

    #[derive(Copy, Drop, Serde)]
    struct Winner {
        player_address: ContractAddress,
        prize_money: u128
    }

    #[derive(Copy, Drop, Serde)]
    struct Game {
        game_id: u128,
        game_owner: ContractAddress,
        game_status: felt252,
        game_winning_number: u128
    }


    #[constructor]
    fn constructor(
        ref self: ContractState,
        id: u128,
        caller_address: ContractAddress,
        game_handler_address: ContractAddress
    ) {
        self.game_id.write(id);
        self.game_owner.write(caller_address);
        self.game_status.write('NOT_STARTED');
        self.game_handler_address.write(game_handler_address);
    }

    #[external(v0)]
    impl RussianStarklette of super::IRussianStarklette<ContractState> {
        fn get_game(self: @ContractState) -> Game {
            let game = Game {
                game_id: self.game_id.read(),
                game_owner: self.game_owner.read(),
                game_status: self.game_status.read(),
                game_winning_number: self.game_winning_number.read()
            };
            game
        }
        fn start_game(ref self: ContractState) {
            let caller_address: ContractAddress = get_caller_address();
            assert(caller_address == self.game_owner.read(), 'only owner can start the game');
            let current_state = self.game_status.read();
            if (current_state != 'NOT_STARTED') {
                panic_with_felt252('game already started or ended');
            }
            self.game_status.write('ONGOING');
            self
                .emit(
                    GameStarted {
                        game_status: self.game_status.read(), game_id: self.game_id.read()
                    }
                );
        }
        fn place_bet(ref self: ContractState, bet_number: u128, bet_amount: u128) {
            assert(self.game_status.read() == 'ONGOING', 'game not started yet');
            assert(bet_number > 0, 'choose between 1-100');
            assert(bet_number < 101, 'choose between 1-100');
            assert(bet_amount > 0, 'amount should be >0');

            let caller_address: ContractAddress = get_caller_address();

            let game_handler = IRussianStarkletteDeployerDispatcher {
                contract_address: self.game_handler_address.read()
            };
            let player_current_balance = game_handler.get_player_balance(caller_address);
            assert(bet_amount <= player_current_balance, 'not enough balace');

            self.bets_detail.write(caller_address, (bet_number, bet_amount));
            game_handler.decrease_player_balance(caller_address, bet_amount);
            self._add_to_players(caller_address);
            self.emit(BetPlaced { amount: bet_amount, number: bet_number, player: caller_address });
        }
        fn update_bet_number(ref self: ContractState, bet_number: u128) {
            assert(self.game_status.read() == 'ONGOING', 'game not started yet');
            assert(bet_number > 0, 'choose between 1-100');
            assert(bet_number < 101, 'choose between 1-100');

            let caller_address: ContractAddress = get_caller_address();
            assert(self._check_player_participation(caller_address), 'no bets from player');

            let (current_bet_number, current_bet_amount) = self.bets_detail.read(caller_address);
            self.bets_detail.write(caller_address, (bet_number, current_bet_amount));
            self
                .emit(
                    BetUpdated {
                        old_bet_amount: current_bet_amount,
                        new_bet_amount: current_bet_amount,
                        old_bet_number: current_bet_number,
                        new_bet_number: bet_number,
                        player: caller_address
                    }
                );
        }
        fn update_bet_amount(ref self: ContractState, bet_amount: u128) {
            assert(self.game_status.read() == 'ONGOING', 'game not started yet');
            assert(bet_amount > 0, 'amount should be >0');

            let caller_address: ContractAddress = get_caller_address();
            assert(self._check_player_participation(caller_address), 'no bets from player');

            let game_handler = IRussianStarkletteDeployerDispatcher {
                contract_address: self.game_handler_address.read()
            };

            let player_current_balance = game_handler.get_player_balance(caller_address);
            let (current_bet_number, current_bet_amount) = self.bets_detail.read(caller_address);

            if (current_bet_amount >= bet_amount) {
                self.bets_detail.write(caller_address, (current_bet_number, bet_amount));
                game_handler
                    .increase_player_balance(caller_address, current_bet_amount - bet_amount);
            } else {
                let balance_needed = bet_amount - current_bet_amount;
                assert(balance_needed <= player_current_balance, 'not enough balace');
                self.bets_detail.write(caller_address, (current_bet_number, bet_amount));
                game_handler.decrease_player_balance(caller_address, balance_needed);
            }
            self
                .emit(
                    BetUpdated {
                        old_bet_amount: current_bet_amount,
                        new_bet_amount: bet_amount,
                        old_bet_number: current_bet_number,
                        new_bet_number: current_bet_number,
                        player: caller_address
                    }
                );
        }
        fn end_game(ref self: ContractState) {
            assert(self.game_status.read() == 'ONGOING', 'game not started or ended');
            let caller_address: ContractAddress = get_caller_address();
            assert(caller_address == self.game_owner.read(), 'only owner can end the game');
            let winning_number = self._generate_random_number();
            let (winner_address, total_balance, winner_bets_total, winner_player_bets) = self
                ._find_winning_players(winning_number);
            let (winners, owner_fees) = self
                ._get_prize_pool(
                    winner_address, total_balance, winner_bets_total, winner_player_bets
                );

            self._distribute_prize_pool(@winners, owner_fees);

            self
                .emit(
                    GameEnded {
                        game_status: 'ENDED',
                        game_id: self.game_id.read(),
                        game_winning_number: winning_number,
                        winners: winners
                    }
                );
        }
    }

    #[generate_trait]
    impl Private of PrivateTrait {
        fn _generate_random_number(self: @ContractState) -> u128 {
            let block_info = get_execution_info().unbox().block_info;
            let block_numer = block_info.unbox().block_number;
            let block_timestamp = block_info.unbox().block_timestamp;
            let random_number: u128 = ((block_numer + block_timestamp) % 100 + 1).into();
            random_number
        }

        fn _check_player_participation(
            self: @ContractState, player_address: ContractAddress
        ) -> bool {
            let player_list: List<ContractAddress> = self.players.read();
            let player_array: Array<ContractAddress> = player_list.array();
            let player_index = player_array.index_of(player_address);

            if (player_index.is_some()) {
                return true;
            }
            false
        }

        fn _add_to_players(ref self: ContractState, player_address: ContractAddress) {
            let player_already_added = self._check_player_participation(player_address);
            if (!player_already_added) {
                let mut player_list: List<ContractAddress> = self.players.read();
                player_list.append(player_address);
            }
        }

        fn _find_winning_players(
            self: @ContractState, lucky_number: u128
        ) -> (Array<ContractAddress>, u128, u128, Array<u128>) {
            let mut winner_address: Array<ContractAddress> = array![];
            let mut winner_player_bets: Array<u128> = array![];
            let player_list: List<ContractAddress> = self.players.read();
            let player_array: Array<ContractAddress> = player_list.array();
            let player_array_length = player_array.len();
            let mut current_index = 0;
            let mut total_balance = 0;
            let mut winner_bets_total = 0;

            loop {
                if (current_index == player_array_length) {
                    break;
                }
                let current_player_address = *player_array.at(current_index);
                let (current_bet_number, current_bet_amount) = self
                    .bets_detail
                    .read(current_player_address);
                if (current_bet_number == lucky_number) {
                    winner_address.append(current_player_address);
                    winner_player_bets.append(current_bet_amount);
                    winner_bets_total += current_bet_amount;
                }
                total_balance += current_bet_amount;
                current_index += 1;
            };
            (winner_address, total_balance, winner_bets_total, winner_player_bets)
        }

        fn _get_prize_pool(
            self: @ContractState,
            winner_address: Array<ContractAddress>,
            total_balance: u128,
            winner_bets_total: u128,
            winner_player_bets: Array<u128>
        ) -> (Array<Winner>, u128) {
            let winner_player_array_length = winner_address.len();
            let mut current_index = 0;
            let prize_pool = total_balance - winner_bets_total;
            let game_handler = IRussianStarkletteDeployerDispatcher {
                contract_address: self.game_handler_address.read()
            };
            let mut left_out_balance = total_balance;
            let mut winners: Array<Winner> = array![];
            loop {
                if (current_index == winner_player_array_length) {
                    break;
                }
                let bet_amount = *winner_player_bets.at(current_index);
                let player_prize = bet_amount + ((bet_amount * prize_pool) / total_balance);
                let new_winner = Winner {
                    player_address: *winner_address.at(current_index), prize_money: player_prize
                };
                winners.append(new_winner);
                left_out_balance -= player_prize;
                current_index += 1;
            };
            (winners, left_out_balance)
        }

        fn _distribute_prize_pool(self: @ContractState, winners: @Array<Winner>, owner_fees: u128) {
            let winners_length = winners.len();
            let mut current_index = 0;
            let game_handler = IRussianStarkletteDeployerDispatcher {
                contract_address: self.game_handler_address.read()
            };
            loop {
                if (current_index == winners_length) {
                    break;
                }
                let winner_here: Winner = *winners.at(current_index);
                game_handler
                    .increase_player_balance(winner_here.player_address, winner_here.prize_money);
                current_index += 1;
            };
            game_handler.increase_player_balance(self.game_owner.read(), owner_fees);
        }
    }
}
