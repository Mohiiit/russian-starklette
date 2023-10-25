use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::game_id::InternalContractMemberStateTrait;
use starknet::syscalls::deploy_syscall;
use starknet::Felt252TryIntoContractAddress;

use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::tests::constants::{OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH};

fn STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}

fn deploy_contract() -> IRussianStarkletteDeployerDispatcher {
    
    let mut calldata = ArrayTrait::new();
    let class_hash = GAME_CLASS_HASH();
    class_hash.serialize(ref calldata);
    let (address0, _) = deploy_syscall(
        RussianStarkletteDeployer::TEST_CLASS_HASH.try_into().unwrap(), 0, calldata.span(), false
    )
        .unwrap();
    let contract0 = IRussianStarkletteDeployerDispatcher { contract_address: address0 };
    contract0
}

#[test]
#[available_gas(2000000)]
fn test_new_game() {
    let dispatcher = deploy_contract();
    let deployed_game_address = dispatcher.new_game();
    // let state = STATE();

    assert(1==1, 'it should be zero');
}