use starknet::ContractAddress;
use alexandria_storage::list::{List, ListTrait};

#[starknet::interface]
trait IRussianStarklette<TContractState> {
    
}

#[starknet::contract]
mod RussianStarklette {
    use starknet::{ContractAddress, get_caller_address};
    use alexandria_storage::list::{List, ListTrait};
    use starknet::contract_address_try_from_felt252;

    #[storage]
    struct Storage {
        id: u128,
        owner: ContractAddress,
        status: felt252,
        number: u128,
        bets_amount: LegacyMap<ContractAddress, u128>,
        bets_number: LegacyMap<ContractAddress, u128>
    }

    #[constructor]
    fn constructor(ref self: ContractState, caller_address: felt252, id: felt252) {
        let id: u128 = id.try_into().unwrap();
        let owner = contract_address_try_from_felt252(caller_address).unwrap();
        self.owner.write(owner);
        self.status.write('NOT_STARTED');
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
    }

}
