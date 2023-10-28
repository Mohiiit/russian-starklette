use cairo_1_russian_roulette::game::IRussianStarkletteDispatcherTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
use starknet::syscalls::deploy_syscall;
use starknet::{
    ContractAddress, get_caller_address, get_execution_info, ClassHash, class_hash_try_from_felt252
};
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::game::IRussianStarkletteDispatcher;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{
    game_ownersContractMemberStateTrait, game_idContractMemberStateTrait,
    game_contract_hashContractMemberStateTrait, player_balanceContractMemberStateTrait
};
use cairo_1_russian_roulette::tests::constants::{
    OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH
};

fn GAME_STATE() -> RussianStarklette::ContractState {
    RussianStarklette::contract_state_for_testing()
}

fn GAME_HANDLER_STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}

fn MOCK_GAME_DEPLOYED() -> ContractAddress {
    let caller_address: ContractAddress = PLAYER_ONE();
    let mut state = GAME_HANDLER_STATE();
    let class_hash = class_hash_try_from_felt252(RussianStarklette::TEST_CLASS_HASH).unwrap();
    state.game_contract_hash.write(class_hash);
    state._increase_player_balance(PLAYER_ONE(), 200);

    let new_game_address = state._deploy_new_game();
    new_game_address
}

#[test]
#[available_gas(2000000)]
fn test_placing_bets() {
    let game_address = MOCK_GAME_DEPLOYED();
    let mut game_state = GAME_STATE();

    let game_dispacther = IRussianStarkletteDispatcher { contract_address: game_address };
    let contract_response = game_dispacther.place_bet(PLAYER_ONE(),2, 0);

    assert(contract_response, 'issue in placing bet');
}

