use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{
    game_idContractMemberStateTrait, game_contract_hashContractMemberStateTrait,
    player_balanceContractMemberStateTrait
};

use starknet::syscalls::{deploy_syscall, storage_read_syscall};
use starknet::Felt252TryIntoContractAddress;
use starknet::{
    ContractAddress, get_caller_address, get_execution_info, ClassHash, class_hash_try_from_felt252
};
use starknet::testing::{pop_log, set_contract_address};

use debug::PrintTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployer;
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::tests::constants::{
    OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH
};
use starknet::storage_access::{storage_base_address_from_felt252, storage_address_from_base_and_offset};
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{GameCreated, BalanceUpdated};


fn deploy_contract() -> (IRussianStarkletteDeployerDispatcher, ContractAddress) {
    let mut calldata = ArrayTrait::new();
    let class_hash = RussianStarklette::TEST_CLASS_HASH;
    class_hash.serialize(ref calldata);

    let (address0, _) = deploy_syscall(
        RussianStarkletteDeployer::TEST_CLASS_HASH.try_into().unwrap(), 0, calldata.span(), false
    )
        .unwrap();
    let contract0 = IRussianStarkletteDeployerDispatcher { contract_address: address0 };
    (contract0, address0)
}

fn STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}
#[test]
#[available_gas(2000000)]
fn test_new_game_ownership() {
    let (game_handler, game_handler_address) = deploy_contract();
    game_handler.new_game(PLAYER_ONE(), game_handler_address);
    let event = pop_log::<GameCreated>(game_handler.contract_address).unwrap();
    assert(event.owner_address == PLAYER_ONE(), 'error in owner address');
    assert(event.game_id == 1, 'error in owner address');
}

#[test]
#[available_gas(2000000)]
fn test_internal_increase_balance_function() {
    let mut state = STATE();
    let old_player_balance = state.player_balance.read(PLAYER_ONE());
    assert(old_player_balance==0, 'initial aomunt must be 0');
    state._increase_player_balance(PLAYER_ONE(), 200);
    let new_player_balance = state.player_balance.read(PLAYER_ONE());
    assert(new_player_balance==200, 'updation amount must be 200');
}

#[test]
#[available_gas(2000000)]
fn test_internal_decrease_balance_function() {
    let mut state = STATE();
    state.player_balance.write(PLAYER_ONE(), 200);
    let old_player_balance = state.player_balance.read(PLAYER_ONE());
    assert(old_player_balance==200, 'initial aomunt must be 200');
    state._decrease_player_balance(PLAYER_ONE(), 101);
    let new_player_balance = state.player_balance.read(PLAYER_ONE());
    assert(new_player_balance==99, 'updation amount must be 99');
}

#[test]
#[available_gas(2000000)]
fn test_internal_get_player_balance() {
    let mut state = STATE();

    let player_balance_0 = state._get_player_balance(PLAYER_ONE());
    assert(player_balance_0==0, 'player balance must be 0');

    state.player_balance.write(PLAYER_ONE(), 199);
    let player_balance_1 = state._get_player_balance(PLAYER_ONE());
    assert(player_balance_1==199, 'player balance must be 199');
}

#[test]
#[available_gas(2000000)]
fn test_external_get_player_balance() {
    let mut state = STATE();
    state.player_balance.write(PLAYER_ONE(), 200);
    let expected = 200;
    assert(IRussianStarkletteDeployer::get_player_balance(@state, PLAYER_ONE())==expected, 'issue in external get balance');
}

#[test]
#[available_gas(2000000)]
fn test_external_increase_balance_function() {
    set_contract_address(PLAYER_ONE());
    let (game_handler, game_handler_address) = deploy_contract();
    game_handler.increase_player_balance(PLAYER_ONE(), 2001);
    let update_balance = game_handler.get_player_balance(PLAYER_ONE());
    assert(update_balance==2001, 'should be 2001');
}

