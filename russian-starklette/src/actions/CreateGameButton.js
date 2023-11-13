import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useAccount } from '../context/AccountContext';
import { useGame } from '../context/ProviderContext';
import { createGameFactoryContract } from '../utils';

function GameFactoryButton({setOwnedGames}) {
  const [isCreating, setIsCreating] = React.useState(false); // State to track contract creation progress
  const { account } = useAccount();
  const { provider, gameHandler } = useGame();

  const handleCreateContract = async () => {
    setIsCreating(true);

    try {
        const current_Contract = await gameHandler;
      const gameFactoryContract = await createGameFactoryContract(provider, current_Contract.address);
      gameFactoryContract.connect(account);
      const myCall = gameFactoryContract.populate("new_game", [
        account.address,
        current_Contract.address
      ]);
      const res = await gameFactoryContract.new_game(myCall.calldata);
      const res2 = await provider.waitForTransaction(res.transaction_hash);
      console.log(res, res2);
      console.log(res2.events[0].data[0], res2.events[0].data[0]);
      setOwnedGames((prevState) => [...prevState, res2.events[0].data[0]])
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating the contract:', error);
      setIsCreating(false);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateContract}
        disabled={isCreating}
        startIcon={isCreating ? <CircularProgress size={20} /> : null}
      >
        {isCreating ? 'Creating New Game ...' : 'Create New Game'}
      </Button>
    </div>
  );
}

export default GameFactoryButton;
