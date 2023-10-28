use starknet::syscalls::deploy_syscall;
use starknet::{ContractAddress, get_caller_address,get_execution_info, ClassHash, class_hash_try_from_felt252};
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::tests::constants::{OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH};

fn GAME_STATE() -> RussianStarklette::ContractState {
    RussianStarklette::contract_state_for_testing()
}

fn GAME_HANDLER_STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}