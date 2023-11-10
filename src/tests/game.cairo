use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployer;
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
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
use starknet::testing::pop_log;

fn GAME_STATE() -> RussianStarklette::ContractState {
    RussianStarklette::contract_state_for_testing()
}

fn GAME_HANDLER_STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}

fn mock_game_and_game_handler() -> (IRussianStarkletteDeployerDispatcher, ContractAddress, IRussianStarkletteDispatcher, ContractAddress) {
    let (game_handler, game_handler_address) = deploy_contract();
    game_handler.new_game(PLAYER_ONE(), game_handler_address);
    let event = pop_log::<GameCreated>(game_handler.contract_address).unwrap();
    let game = IRussianStarkletteDispatcher {contract_address: event.game_address};
    (game_handler, game_handler_address, game, event.game_address)
}

#[test]
#[available_gas(2000000)]
fn test_get_game() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();
    let function_response = game.get_game();
    assert(function_response.game_id==1, 'should be one');
    assert(function_response.game_owner==PLAYER_ONE(), 'should be player one');
    assert(function_response.game_status=='NOT_STARTED', 'shouldnt have started');
    assert(function_response.game_winning_number==0, 'should be zero');
}

#[test]
#[available_gas(2000000)]
fn test_start_game() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();
    set_contract_address(PLAYER_ONE());
    game.start_game();
    let event = pop_log::<GameStarted>(game.contract_address).unwrap();
    assert(event.game_id==1, 'must be 1');
    assert(event.game_status=='ONGOING', 'must have started');
}

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('only owner can start the game', 'ENTRYPOINT_FAILED'))]
fn test_panic_start_game() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();
    set_contract_address(PLAYER_TWO());
    game.start_game();
}

#[test]
#[available_gas(200000000)]
fn test_placing_bets() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();

    set_contract_address(PLAYER_ONE());
    game.start_game();
    let event = pop_log::<GameStarted>(game.contract_address).unwrap();

    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);
    game.place_bet(69, 101);

    let event = pop_log::<BetPlaced>(game.contract_address).unwrap();
    assert(event.amount == 101, 'error in bet amount');
    assert(event.number == 69, 'error in bet number');
    assert(event.player == PLAYER_TWO(), 'error in bet player');
}

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('game not started yet', 'ENTRYPOINT_FAILED'))]
fn test_panic_placing_bets_game_not_started() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();

    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);
    game.place_bet(69, 101);
}

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('amount should be >0', 'ENTRYPOINT_FAILED'))]
fn test_panic_placing_bets_bet_amount_zero() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();

    set_contract_address(PLAYER_ONE());
    game.start_game();

    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);
    game.place_bet(69, 0);
}

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('choose between 1-100', 'ENTRYPOINT_FAILED'))]
fn test_panic_placing_bets_bet_number_too_large() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();

    set_contract_address(PLAYER_ONE());
    game.start_game();

    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);
    game.place_bet(101, 100);
}

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('choose between 1-100', 'ENTRYPOINT_FAILED'))]
fn test_panic_placing_bets_bet_number_too_small() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();

    set_contract_address(PLAYER_ONE());
    game.start_game();

    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);
    game.place_bet(0, 100);
}

#[test]
#[available_gas(2000000)]
#[should_panic(expected: ('not enough balace', 'ENTRYPOINT_FAILED'))]
fn test_panic_placing_bets_not_enough_balance() {
    let (game_handler, game_handler_address, game, game_address) = mock_game_and_game_handler();

    set_contract_address(PLAYER_ONE());
    game.start_game();

    set_contract_address(PLAYER_TWO());
    game_handler.increase_player_balance(PLAYER_TWO(), 200);
    game.place_bet(100, 201);
}

#[test]
#[available_gas(2000000)]
fn test_placing_bet_internal() {
    
}


// #[test]
// #[available_gas(20000000)]
// fn test_placing_bets() {
//     set_caller_address(PLAYER_ONE());
//     set_contract_address(PLAYER_ONE());
//     let (game_handler, game_handler_address) = deploy_contract();
//     let response = game_handler.new_game(PLAYER_TWO(), game_handler_address);
//     let event = pop_log::<GameCreated>(game_handler.contract_address).unwrap();
//     assert(event.owner_address == PLAYER_TWO(), 'error in owner address');
//     let game_address = event.game_address;
//     set_contract_address(PLAYER_TWO());
//     game_handler.increase_player_balance(PLAYER_TWO(), 200);

//     let game_dispacther = IRussianStarkletteDispatcher { contract_address: game_address };
//     let current_owner = game_dispacther.get_game();
//     assert(current_owner.game_owner == PLAYER_TWO(), 'one should be owner');

// let start_game = game_dispacther.start_game();
//     let event = pop_log::<GameStarted>(game_dispacther.contract_address).unwrap();
//     assert(event.game_id == 1, 'error in game id');
//     assert(event.game_status == 'ONGOING', 'error in game status');
// let contract_response = game_dispacther.place_bet(2, 200);
// let event = pop_log::<BetPlaced>(game_dispacther.contract_address).unwrap();

//     assert(event.amount == 200, 'error in bet amount');
//     assert(event.number == 2, 'error in bet number');
//     assert(event.player == PLAYER_TWO(), 'error in bet player');

// }
