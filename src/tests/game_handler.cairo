use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{
    game_idContractMemberStateTrait, game_contract_hashContractMemberStateTrait,
    player_balanceContractMemberStateTrait
};

use starknet::syscalls::deploy_syscall;
use starknet::Felt252TryIntoContractAddress;
use starknet::{
    ContractAddress, get_caller_address, get_execution_info, ClassHash, class_hash_try_from_felt252
};
use starknet::testing::pop_log;

use debug::PrintTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployer;
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::tests::constants::{
    OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH
};
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

// #[test]
// #[available_gas(2000000)]
// fn test_increase_balance_function() {
//     let mut state = STATE();
//     state._increase_player_balance(PLAYER_ONE(), 200);
//     assert(state.player_balance.read(PLAYER_ONE()) == 200, 'it should be 200');
// }


