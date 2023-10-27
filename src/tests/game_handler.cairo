use core::option::OptionTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::InternalTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{game_ownersContractMemberStateTrait, game_idContractMemberStateTrait, game_contract_hashContractMemberStateTrait};

use starknet::syscalls::deploy_syscall;
use starknet::Felt252TryIntoContractAddress;
use starknet::{ContractAddress, get_caller_address,get_execution_info, ClassHash, class_hash_try_from_felt252};
use debug::PrintTrait;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::game::RussianStarklette;
use cairo_1_russian_roulette::tests::constants::{OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH};


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

fn STATE() -> RussianStarkletteDeployer::ContractState {
    RussianStarkletteDeployer::contract_state_for_testing()
}

#[test]
#[available_gas(2000000)]
fn test_new_game() {
    let caller_address: ContractAddress = PLAYER_ONE();
    let mut state = STATE();
    let class_hash = class_hash_try_from_felt252(RussianStarklette::TEST_CLASS_HASH).unwrap();
    state.game_contract_hash.write(class_hash);

    let new_game_address = state._deploy_new_game();
    state._set_game_id();
    state._set_game_owner(new_game_address, caller_address);
    state._update_game_status('NOT_STARTED', new_game_address);
    
    assert(state.game_id.read() == 1, 'it should be one');
    assert(state.game_owners.read(new_game_address)==PLAYER_ONE(), 'caller should be the owner');
}