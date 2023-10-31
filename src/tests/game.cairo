use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::game::IRussianStarkletteDispatcherTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
use starknet::syscalls::deploy_syscall;
use starknet::{
    ContractAddress, get_caller_address, get_execution_info, ClassHash, class_hash_try_from_felt252
};
use starknet::testing::{set_caller_address, set_contract_address};
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::game::IRussianStarkletteDispatcher;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{
    game_ownersContractMemberStateTrait, game_idContractMemberStateTrait,
    game_contract_hashContractMemberStateTrait, player_balanceContractMemberStateTrait
};
use cairo_1_russian_roulette::tests::game_handler::{deploy_contract};
use cairo_1_russian_roulette::tests::constants::{
    OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH
};

fn GAME_STATE() -> RussianStarklette::ContractState {
    RussianStarklette::contract_state_for_testing()
}

fn GAME_HANDLER_STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}

// fn MOCK_GAME_DEPLOYED() -> (RussianStarkletteDeployer::ContractState, ContractAddress) {
//     let caller_address: ContractAddress = PLAYER_ONE();
//     let mut state = GAME_HANDLER_STATE();
//     let class_hash = class_hash_try_from_felt252(RussianStarklette::TEST_CLASS_HASH).unwrap();
//     state.game_contract_hash.write(class_hash);
//     state._increase_player_balance(PLAYER_ONE(), 200);

//     let new_game_address = state._deploy_new_game();
//     (state, new_game_address)
// }

#[test]
#[available_gas(2000000)]
fn test_placing_bets() {
    set_caller_address(PLAYER_ONE());
    set_contract_address(PLAYER_ONE());
    let (game_handler, game_address) = deploy_contract();
    let new_game_address = game_handler.new_game(PLAYER_ONE(), game_address);

    set_caller_address(PLAYER_TWO());
    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);

    let game_dispacther = IRussianStarkletteDispatcher { contract_address: new_game_address };
    let current_owner = game_dispacther.get_game_owner();
    assert(current_owner==PLAYER_ONE(), 'one should be owner');

    set_caller_address(PLAYER_ONE());
    set_contract_address(PLAYER_ONE());
    let start_game = game_dispacther.start_game();

    set_caller_address(PLAYER_TWO());
    set_contract_address(PLAYER_TWO());
    let contract_response = game_dispacther.place_bet(PLAYER_TWO(), 2, 200);

    assert(contract_response, 'issue in placing bet');
}
