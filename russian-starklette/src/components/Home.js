import React, { useEffect, useState } from 'react';
import {
  Account,
  Provider,
  Contract,
  RpcProvider,
  shortString,
  cairo,
  stark,
} from "starknet";
import GameList from './GameList';
import BetForm from './PlaceBet';

const Home = () => {
  const [currentContract, setCurrentContract] = useState();
  const [account1, setAccount1] = useState();
  const [account2, setAccount2] = useState();
  const [provider, setProvider] = useState();
  const [balance, setBalance] = useState(0);
  const [currentGameContract, setCurrentGameContract] = useState();
  const [allGames, setAllGames] = useState([]);

  const initializeProvider = async () => {
    const currProvider = new RpcProvider({ sequencer: { baseUrl: "http://0.0.0.0:5050" } });
    setProvider(currProvider);

    const privateKey1 = '0x1800000000300000180000000000030000000000003006001800006600';
    const accountAddress1 = "0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973";
    const account1 = new Account(currProvider, accountAddress1, privateKey1);
    setAccount1(account1);

    const privateKey2 = '0x33003003001800009900180300d206308b0070db00121318d17b5e6262150b';
    const accountAddress2 = "0x5686a647a9cdd63ade617e0baf3b364856b813b508f03903eb58a7e622d5855";
    const account2 = new Account(currProvider, accountAddress2, privateKey2);

    const gameFactoryContractAddress = '0x01cf757a0fe6f8297ddddb670c4e2ea9947b62d8c934c6f3f651c437f6b4fa08';
    const { abi: gameFactoryAbi } = await currProvider.getClassAt(gameFactoryContractAddress);

    if (gameFactoryAbi === undefined) {
      throw new Error("no abi.");
    }

    const gameFactoryContract = new Contract(gameFactoryAbi, gameFactoryContractAddress, provider);
    gameFactoryContract.connect(account1);
    setCurrentContract(gameFactoryContract);

    console.log(currProvider, gameFactoryContract);
  };

  const increasePlayerBalance = async () => {
    const myCall = currentContract.populate("increase_player_balance", [
      '0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973', 3000
    ]);
    const res = await currentContract.increase_player_balance(myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
    await getPlayerBalance();
  };

  const getPlayerBalance = async () => {
    const response = await currentContract.get_player_balance('0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973');
    setBalance(response.toString());
  };

  const decreasePlayerBalance = async () => {
    const myCall = currentContract.populate("decrease_player_balance", [
      '0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973', 3000
    ]);
    const res = await currentContract.decrease_player_balance(myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
    await getPlayerBalance();
  };

  const createNewGame = async () => {
    const myCall = currentContract.populate("new_game", [
      '0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973',
      '0x01cf757a0fe6f8297ddddb670c4e2ea9947b62d8c934c6f3f651c437f6b4fa08'
    ]);
    const res = await currentContract.new_game(myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    const listEvents = res2.events;
    const myDecodedString = shortString.decodeShortString("0x7572692f706963742f7433382e6a7067");
    console.log('create new game', listEvents[0].keys[1], listEvents[0].data[0], listEvents[0].data[1]);
  };

  const setCurrentGameContractFun = async (contractAddress) => {
    const { abi: gameAbi } = await provider.getClassAt(contractAddress);

    if (gameAbi === undefined) {
      throw new Error("no abi.");
    }

    const gameContract = new Contract(gameAbi, contractAddress, provider);
    gameContract.connect(account1);
    setCurrentGameContract(gameContract);
  };

  const startGame = async() => {
    const res = await currentGameContract.start_game();
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
  }

  const getAllGames = async () => {
    const response = await currentContract.get_all_games();
    const result = decimalsToHexStrings(response);
    setAllGames(result);
    console.log(result);
  };

  function decimalsToHexStrings(decimalArray) {
    return decimalArray.map(decimalValue => {
      const hexString = decimalValue.toString(16);
      return '0x0' + hexString;
    });
  }

  const getOwner = async () => {
    const response = await currentContract.get_owner();
    console.log('owner-> ', response);
  };

  useEffect(() => {
    initializeProvider();
  }, []);

  return (
    <div>
      <button onClick={increasePlayerBalance}>Increase player balance</button>
      <button onClick={decreasePlayerBalance}>Decrease player balance</button>
      <button onClick={createNewGame}>Create New Game</button>
      <button onClick={getAllGames}>Get all games</button>
      <button onClick={startGame}>Start the game</button>
      <div>Here is the balance: {balance}</div>
      <GameList {...{allGames, setCurrentGameContractFun}}/>
      <BetForm {...{currentGameContract, provider, account1}}/>
    </div>
  );
};

export default Home;
