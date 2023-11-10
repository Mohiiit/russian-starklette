use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcherTrait;
use cairo_1_russian_roulette::tests::game_handler::deploy_contract;
use cairo_1_russian_roulette::game::IRussianStarkletteDispatcher;
use cairo_1_russian_roulette::game_handler::IRussianStarkletteDeployerDispatcher;
use starknet::ContractAddress;
use cairo_1_russian_roulette::tests::constants::{
    OWNER, PLAYER_ONE, PLAYER_TWO, OTHER_OWNER, GAME_CLASS_HASH
};
use starknet::testing::pop_log;
use cairo_1_russian_roulette::game_handler::RussianStarkletteDeployer::{GameCreated, BalanceUpdated};

fn mock_game_and_game_handler() -> (IRussianStarkletteDeployerDispatcher, ContractAddress, IRussianStarkletteDispatcher, ContractAddress) {
    let (game_handler, game_handler_address) = deploy_contract();
    game_handler.new_game(PLAYER_ONE(), game_handler_address);
    let event = pop_log::<GameCreated>(game_handler.contract_address).unwrap();
    let game = IRussianStarkletteDispatcher {contract_address: event.game_address};
    (game_handler, game_handler_address, game, event.game_address)
}