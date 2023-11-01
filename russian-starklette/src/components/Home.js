import React, { useEffect, useState } from 'react'
import { Account, Provider, Contract,RpcProvider } from "starknet";

const Home = () => {
    
    const [currentContract, setCurrentContract] = useState();
    const [account1, setAccount1] = useState();
    const [account2, setAccount2] = useState();
    const [provider, setProvider] = useState();
    const [balance, setBalance] = useState(0);

    const first_thing = async() => {
        const curr_provider = new RpcProvider({ sequencer: { baseUrl:"http://0.0.0.0:5050"} });
        setProvider(curr_provider);
        const privateKey1 = '0x1800000000300000180000000000030000000000003006001800006600';
        const accountAddress1 = "0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973";
        const account1 = new Account(curr_provider, accountAddress1, privateKey1);

        const privateKey2 = '0x33003003001800009900180300d206308b0070db00121318d17b5e6262150b';
        const accountAddress2 = "0x5686a647a9cdd63ade617e0baf3b364856b813b508f03903eb58a7e622d5855";
        const account2 = new Account(curr_provider, accountAddress2, privateKey2);


        const game_factory_contract_address = '0x0789b13e94a7c8c95d2471f4f257b18672171eb55b9f86aaf4db944593be3479';
        const { abi: game_factory_Abi } = await curr_provider.getClassAt(game_factory_contract_address);
        if (game_factory_Abi === undefined) { throw new Error("no abi.") };
        const game_factory_contract = new Contract(game_factory_Abi, game_factory_contract_address, provider);
        game_factory_contract.connect(account1);
        setCurrentContract(game_factory_contract);
        console.log(curr_provider, game_factory_contract);
    }

    const increase_player_balance = async() => {
        const myCall = currentContract.populate("increase_player_balance", ['0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973',3000]);
        const res = await currentContract.increase_player_balance(myCall.calldata);
        const res2 = await provider.waitForTransaction(res.transaction_hash); 
        console.log(res, res2);
        await get_player_balance();
    }

    const get_player_balance = async() => {
        const response = await currentContract.get_player_balance('0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973');
        setBalance(response.toString());
    }

    const decrease_player_balance = async() => {
        const myCall = currentContract.populate("decrease_player_balance", ['0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973',3000]);
        const res = await currentContract.decrease_player_balance(myCall.calldata);
        const res2 = await provider.waitForTransaction(res.transaction_hash); 
        console.log(res, res2);
        await get_player_balance();
    }

    const create_new_game = async() => {
        const myCall = currentContract.populate("new_game", ['0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973','0x0789b13e94a7c8c95d2471f4f257b18672171eb55b9f86aaf4db944593be3479']);
        const res = await currentContract.new_game(myCall.calldata);
        const res2 = await provider.waitForTransaction(res.transaction_hash); 
        console.log(res, res2);
    }

    const get_owner = async() => {
        const response = await currentContract.get_owner();
        console.log('owner-> ',response);
    }

    useEffect(() => {
        first_thing();
    }, []);

    return (
        <div>
            <button onClick={increase_player_balance}>
                Increase player balance
            </button>
            <button onClick={decrease_player_balance}>
                Decrease player balance
            </button>
            <button onClick={create_new_game}>
                Create New Game
            </button>
            <div>
                Here is the balance {balance}
            </div>
        </div>
    )
}

export default Home