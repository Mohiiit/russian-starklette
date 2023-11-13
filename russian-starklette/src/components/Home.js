import React, { useEffect, useState } from 'react';
import {
  Account,
  Provider,
  Contract,
  RpcProvider,
  shortString,
  cairo,
  stark, hash
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
import { useAccount } from '../context/AccountContext';

import GameFactoryButton from '../actions/CreateGameButton';
import { createGameFactoryContract } from '../utils';

const Home = () => {
  const { setGameProviderInstance , updateGameHandler, updateGameHandlerAddress, provider, gameHandler} = useGame();
  const {account} = useAccount();

  const [allGames, setAllGames] = useState([]);
  const [ownedGames, setOwnedGames] = useState([]);
  const [otherGames, setOtherGames] = useState([]);

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

  async function getOneGame(address, updatedOwnedGames, updateOtherGames) {
    const gameFactoryContract = await createGameFactoryContract(provider, address);
    const response = await gameFactoryContract.get_game();
    const currentGameOwner = '0x' + response.game_owner.toString(16);
    console.log(currentGameOwner, account.address);
    if (currentGameOwner === account.address) {
      

if (!updatedOwnedGames.includes(address)) {
  updatedOwnedGames.push(address);
}

    } else {
      if (!updateOtherGames.includes(address)) {
        updateOtherGames.push(address);
      }
    }
    console.log(response);
  }


  async function getAllGames() {
    const current_Contract = await gameHandler;
    const gameFactoryContract = await createGameFactoryContract(provider, current_Contract.address);
    const response = await gameFactoryContract.get_all_games();
    const result = decimalsToHexStrings(response);
    let updatedOwnedGames = [...ownedGames];
    let updateOtherGames = [...otherGames];
    for (const address of result) {
      await getOneGame(address, updatedOwnedGames, updateOtherGames);
    }
    setOwnedGames(updatedOwnedGames);
    setOtherGames(updateOtherGames);
    setAllGames(result);
  }

  function decimalsToHexStrings(decimalArray) {
    return decimalArray.map(decimalValue => {
      const hexString = decimalValue.toString(16);
      return '0x0' + hexString;
    });
  }



  useEffect(() => {
    if (provider && account) {
      getAllGames();
    }

  }, [provider, account])

  // const ownedGames = [
  //   {
  //     contractAddress: '0x123',
  //     totalBalance: 100.5,
  //   },
  //   // Add more owned games here
  // ];

  // const deployedGames = [
  //   {
  //     contractAddress: '0x456',
  //     totalBalance: 75.2,
  //   },
  //   // Add more deployed games here
  // ];

  return (
    <div>
      <Navbar openAccountModal={handleOpenAccountModal} openBalanceModal={handleOpenBalanceModal}/>
      <AccountModal open={openAccountModal} onClose={handleCloseAccountModal} />
      <BalanceModal open={openBalanceModal} onClose={handleCloseBalanceModal} />

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
      <GameFactoryButton {...{setOwnedGames}}/>

      <GameLists {...{ownedGames, otherGames}}/>
    </div>
  );
};

export default Home;
