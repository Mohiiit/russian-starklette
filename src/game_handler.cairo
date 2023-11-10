use starknet::{ContractAddress, ClassHash};

#[starknet::interface]
trait IRussianStarkletteDeployer<TContractState> {
    fn new_game(
        ref self: TContractState,
        caller_address: ContractAddress,
        game_handler_address: ContractAddress
    );
    fn get_all_games(self: @TContractState) -> Array<ContractAddress>;
    fn get_game_id(self: @TContractState) -> u128;
    fn increase_player_balance(
        ref self: TContractState, player_contract_address: ContractAddress, amount: u128
    );
    fn decrease_player_balance(
        ref self: TContractState, player_contract_address: ContractAddress, amount: u128
    );
    fn get_player_balance(self: @TContractState, player_contract_address: ContractAddress) -> u128;
}

#[starknet::contract]
mod RussianStarkletteDeployer {
    use starknet::{
        ContractAddress, get_caller_address, get_execution_info, ClassHash, SyscallResultTrait,
        StorageAddress, contract_address_to_felt252
    };
    use alexandria_storage::list::{List, ListTrait};
    use alexandria_data_structures::array_ext::ArrayTraitExt;
    use starknet::syscalls::deploy_syscall;
    use cairo_1_russian_roulette::game::RussianStarklette;
    use cairo_1_russian_roulette::game::IRussianStarklette;
    use cairo_1_russian_roulette::game::IRussianStarkletteDispatcher;
    use debug::PrintTrait;

    #[storage]
    struct Storage {
        game_id: u128,
        game_contract_hash: ClassHash,
        player_balance: LegacyMap<ContractAddress, u128>,
                games: List<ContractAddress>
    }

    #[constructor]
    fn constructor(ref self: ContractState, class_hash: ClassHash) {
        self.game_id.write(0);
        self.game_contract_hash.write(class_hash);
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        GameCreated: GameCreated,
        BalanceUpdated: BalanceUpdated
    }

    #[derive(Drop, starknet::Event)]
    struct GameCreated {
        game_address: ContractAddress,
        owner_address: ContractAddress,
        game_id: u128
    }
    #[derive(Drop, starknet::Event)]
    struct BalanceUpdated {
        player: ContractAddress,
        old_balance: u128,
        new_balance: u128
    }

    #[external(v0)]
    impl RussianStarkletteDeployer of super::IRussianStarkletteDeployer<ContractState> {
        fn new_game(
            ref self: ContractState,
            caller_address: ContractAddress,
            game_handler_address: ContractAddress
        ) {
            self._set_game_id();
            let new_game_address = self._deploy_new_game(caller_address, game_handler_address);
            self._add_to_games(new_game_address);
            self
                .emit(
                    GameCreated {
                        game_address: new_game_address,
                        owner_address: caller_address,
                        game_id: self.game_id.read()
                    }
                );
        }

        fn get_all_games(self: @ContractState) -> Array<ContractAddress> {
            self._get_all_games()
        }

        fn get_game_id(self: @ContractState) -> u128 {
            self._get_game_id()
        }

        fn increase_player_balance(
            ref self: ContractState, player_contract_address: ContractAddress, amount: u128
        ) {
            let caller_address: ContractAddress = get_caller_address();
            caller_address.print();
            assert(
                player_contract_address == caller_address
                    || self._check_address_in_games(caller_address),
                'only player can update'
            );
            let player_old_balance = self.player_balance.read(player_contract_address);
            self._increase_player_balance(player_contract_address, amount);
            let player_new_balance = self.player_balance.read(player_contract_address);
            self
                .emit(
                    BalanceUpdated {
                        player: player_contract_address,
                        old_balance: player_old_balance,
                        new_balance: player_new_balance
                    }
                )
        }

        fn decrease_player_balance(
            ref self: ContractState, player_contract_address: ContractAddress, amount: u128
        ) {
            let caller_address: ContractAddress = get_caller_address();
            assert(
                player_contract_address == caller_address
                    || self._check_address_in_games(caller_address),
                'only player can update'
            );
            let player_old_balance = self.player_balance.read(player_contract_address);
            self._decrease_player_balance(player_contract_address, amount);
            let player_new_balance = self.player_balance.read(player_contract_address);
            self
                .emit(
                    BalanceUpdated {
                        player: player_contract_address,
                        old_balance: player_old_balance,
                        new_balance: player_new_balance
                    }
                )
        }

        fn get_player_balance(
            self: @ContractState, player_contract_address: ContractAddress
        ) -> u128 {
            self
            ._get_player_balance(player_contract_address)
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _get_game_id(self: @ContractState) -> u128 {
            self.game_id.read()
        }
        fn _set_game_id(ref self: ContractState) {
            let current_game_id = self.game_id.read();
            self.game_id.write(current_game_id + 1);
        }
        fn _get_all_games(self: @ContractState) -> Array<ContractAddress> {
            let games_list: List<ContractAddress> = self.games.read();
            let games_array: Array<ContractAddress> = games_list.array();
            games_array
        }
        fn _get_player_balance(
            self: @ContractState, player_contract_address: ContractAddress
        ) -> u128 {
            self.player_balance.read(player_contract_address)
        }
        fn _increase_player_balance(
            ref self: ContractState, player_contract_address: ContractAddress, amount: u128
        ) {
            let player_current_balance = self.player_balance.read(player_contract_address);
            self.player_balance.write(player_contract_address, amount + player_current_balance);
        }
        fn _decrease_player_balance(
            ref self: ContractState, player_contract_address: ContractAddress, amount: u128
        ) {
            let player_current_balance = self.player_balance.read(player_contract_address);
            if (amount >= player_current_balance) {
                self.player_balance.write(player_contract_address, 0);
            } else {
                self.player_balance.write(player_contract_address, player_current_balance - amount);
            }
        }
        fn _check_address_in_games(self: @ContractState, game_address: ContractAddress) -> bool {
            let all_games_list: List<ContractAddress> = self.games.read();
            let all_games_array: Array<ContractAddress> = all_games_list.array();
            let current_game_index = all_games_array.index_of(game_address);

            if (current_game_index.is_some()) {
                return true;
            }
            false
        }
        fn _add_to_games(ref self: ContractState, new_game_address: ContractAddress) {
            let mut games = self.games.read();
            games.append(new_game_address);
            self.games.write(games);
        }
        fn _deploy_new_game(
            ref self: ContractState,
            caller_address: ContractAddress,
            game_handler_address: ContractAddress
        ) -> ContractAddress {
            let game_id = self.game_id.read();
            let mut calldata = array![
                game_id.into(), caller_address.into(), game_handler_address.into()
            ];
            let (new_game_address, _) = deploy_syscall(
                self.game_contract_hash.read(), 0, calldata.span(), false
            )
                .expect('failed to deploy counter');
            new_game_address
        }
    }
}
