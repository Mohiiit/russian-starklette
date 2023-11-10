use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::game::IRussianStarkletteDispatcherTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
use starknet::syscalls::deploy_syscall;
use starknet::{
    ContractAddress, get_caller_address, get_execution_info, ClassHash, class_hash_try_from_felt252,
    contract_address_try_from_felt252
};
use starknet::testing::{set_caller_address, set_contract_address};
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::game::IRussianStarkletteDispatcher;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{
    game_idContractMemberStateTrait, game_contract_hashContractMemberStateTrait,
    player_balanceContractMemberStateTrait, GameCreated
};
use cairo_1_russian_roulette::game::RussianStarklette::{GameStarted, GameEnded, BetPlaced, BetUpdated};
use debug::PrintTrait;
use cairo_1_russian_roulette::tests::game_handler::{deploy_contract};
use cairo_1_russian_roulette::tests::constants::{
    OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH
};
use starknet::testing::pop_log;

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
#[available_gas(20000000)]
fn test_placing_bets() {
    set_caller_address(PLAYER_ONE());
    set_contract_address(PLAYER_ONE());
    let (game_handler, game_handler_address) = deploy_contract();
    let response = game_handler.new_game(PLAYER_TWO(), game_handler_address);
    let event = pop_log::<GameCreated>(game_handler.contract_address).unwrap();
    assert(event.owner_address == PLAYER_TWO(), 'error in owner address');
    let game_address = event.game_address;
    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);

    let game_dispacther = IRussianStarkletteDispatcher { contract_address: game_address };
    let current_owner = game_dispacther.get_game_owner();
    assert(current_owner == PLAYER_TWO(), 'one should be owner');

let start_game = game_dispacther.start_game();
    let event = pop_log::<GameStarted>(game_dispacther.contract_address).unwrap();
    assert(event.game_id == 1, 'error in game id');
    assert(event.game_status == 'ONGOING', 'error in game status');
let contract_response = game_dispacther.place_bet(PLAYER_TWO(), 2, 200);
let event = pop_log::<BetPlaced>(game_dispacther.contract_address).unwrap();

    assert(event.amount == 200, 'error in bet amount');
    assert(event.number == 2, 'error in bet number');
    assert(event.player == PLAYER_TWO(), 'error in bet player');

}
