import React, { useEffect, useState } from 'react'
import { Account, Provider, Contract,RpcProvider } from "starknet";

const Home = () => {
    
    const [currentContract, setCurrentContract] = useState();
    const [account1, setAccount1] = useState();
    const [account2, setAccount2] = useState();
    const first_thing = async() => {
        const provider = new RpcProvider({ sequencer: { baseUrl:"http://0.0.0.0:5050"} });
        const privateKey1 = '0x1800000000300000180000000000030000000000003006001800006600';
        const accountAddress1 = "0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973";
        const account1 = new Account(provider, accountAddress1, privateKey1);

        const privateKey2 = '0x33003003001800009900180300d206308b0070db00121318d17b5e6262150b';
        const accountAddress2 = "0x5686a647a9cdd63ade617e0baf3b364856b813b508f03903eb58a7e622d5855";
        const account2 = new Account(provider, accountAddress2, privateKey2);


        const game_factory_contract_address = '0x0789b13e94a7c8c95d2471f4f257b18672171eb55b9f86aaf4db944593be3479';
        const { abi: game_factory_Abi } = await provider.getClassAt(game_factory_contract_address);
        if (game_factory_Abi === undefined) { throw new Error("no abi.") };
        const game_factory_contract = new Contract(game_factory_Abi, game_factory_contract_address, provider);
        setCurrentContract(game_factory_contract);
    }

    const deploy_game = async() => {

    }

    useEffect(() => {
        first_thing();
    }, []);
    return (
        <div>
            <button>
                Deploy Game
            </button>
        </div>
    )
}

export default Home