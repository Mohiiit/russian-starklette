// use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::game_owners::InternalContractMemberStateTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{game_ownersContractMemberStateTrait, game_idContractMemberStateTrait};

use starknet::syscalls::deploy_syscall;
use starknet::Felt252TryIntoContractAddress;
use starknet::{ContractAddress, get_caller_address,get_execution_info, ClassHash};
use debug::PrintTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::tests::constants::{OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH};

fn STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}

fn deploy_contract() -> IRussianStarkletteDeployerDispatcher {
    
    let mut calldata = ArrayTrait::new();
    let class_hash = RussianStarklette::TEST_CLASS_HASH;
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
    let caller_address: ContractAddress = PLAYER_ONE();
    let dispatcher = deploy_contract();
    let deployed_game_address = dispatcher.new_game();
    let state = STATE();
    let current_game_id = state.game_id.read();
    current_game_id.print();
    let mut unsafe_state = RussianStarkletteDeployer::unsafe_new_contract_state();
    assert(unsafe_state.game_owners.read(deployed_game_address) ==PLAYER_ONE(), 'issue here');
    // assert(state.game_id.read()==1, 'it should be one');
}