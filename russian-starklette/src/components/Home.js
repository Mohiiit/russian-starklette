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
import AccountModal from '../modals/AccountModal';
import BalanceModal from '../modals/BalanceModal';
import FailureModal from '../modals/FailureModal';
import SuccessModal from '../modals/SuccessModal';
import GameLists from './GameList';
import GameList from './GameList';
import Navbar from './Navbar';
import BetForm from './PlaceBet';

import { useGame } from '../context/ProviderContext';

const Home = () => {
  const { setGameProviderInstance , updateGameHandler, updateGameHandlerAddress} = useGame();
  const [currentContract, setCurrentContract] = useState();
  const [account1, setAccount1] = useState();
  const [account2, setAccount2] = useState();
  const [provider, setProvider] = useState();
  
  const [currentGameContract, setCurrentGameContract] = useState();
  const [allGames, setAllGames] = useState([]);

  const [openAccountModal, setOpenAccountModal] = useState(false);
  const handleOpenAccountModal = () => {
    setOpenAccountModal(true);
  };

  const handleCloseAccountModal = () => {
    setOpenAccountModal(false);
  };

  const [openBalanceModal, setOpenBalanceModal] = useState(false);
  const handleOpenBalanceModal = () => {
    setOpenBalanceModal(true);
  };

  const handleCloseBalanceModal = () => {
    setOpenBalanceModal(false);
  };

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openFailureSnackbar, setOpenFailureSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');

  const handleOpenSuccessSnackbar = (message) => {
    setSuccessMessage(message);
    setOpenSuccessSnackbar(true);
  };

  const handleOpenFailureSnackbar = (message) => {
    setFailureMessage(message);
    setOpenFailureSnackbar(true);
  };

  const handleCloseSnackbar = (type) => {
    if (type === 'success') {
      setOpenSuccessSnackbar(false);
    } else {
      setOpenFailureSnackbar(false);
    }
  };

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

  const setGameHandlerAddress = async(currProvider, gameFactoryContractAddress) => {
    updateGameHandlerAddress(gameFactoryContractAddress);
    const { abi: gameFactoryAbi } = await currProvider.getClassAt(gameFactoryContractAddress);
    if (gameFactoryAbi === undefined) {
      throw new Error("no abi.");
    }
    const gameFactoryContract = new Contract(gameFactoryAbi, gameFactoryContractAddress, provider);
    return gameFactoryContract;
  }

  
  // useEffect(() => {
  //   initializeProvider();
  //   const currProvider = new RpcProvider({ sequencer: { baseUrl: "http://0.0.0.0:5050" } });
  //   setGameProviderInstance(currProvider);
  //   const gameFactoryContractAddress = '0x01cf757a0fe6f8297ddddb670c4e2ea9947b62d8c934c6f3f651c437f6b4fa08';
  //   const gameFactoryContract = setGameHandlerAddress(currProvider, gameFactoryContractAddress);
  //   updateGameHandler(gameFactoryContract);

  // }, []);

  const ownedGames = [
    {
      contractAddress: '0x123',
      totalBalance: 100.5,
    },
    // Add more owned games here
  ];

  const deployedGames = [
    {
      contractAddress: '0x456',
      totalBalance: 75.2,
    },
    // Add more deployed games here
  ];

  return (
    <div>
      <Navbar openAccountModal={handleOpenAccountModal} openBalanceModal={handleOpenBalanceModal}/>
      <AccountModal open={openAccountModal} onClose={handleCloseAccountModal} />
      <BalanceModal open={openBalanceModal} onClose={handleCloseBalanceModal} currentContract={currentContract} provider={provider}/>

      <SuccessModal
        open={openSuccessSnackbar}
        message={successMessage}
        onClose={() => handleCloseSnackbar('success')}
      />
      <FailureModal
        open={openFailureSnackbar}
        message={failureMessage}
        onClose={() => handleCloseSnackbar('failure')}
      />

      <GameLists {...{ownedGames, deployedGames}}/>
    </div>
  );
};

export default Home;
