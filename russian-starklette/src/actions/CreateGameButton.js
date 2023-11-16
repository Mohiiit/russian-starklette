import React from 'react';
import { Button, CircularProgress, Container } from '@mui/material';
import { useGame } from '../context/ProviderContext';
import { createGameFactoryContract } from '../utils';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


function GameFactoryButton({setOwnedGames}) {
  const [isCreating, setIsCreating] = React.useState(false); // State to track contract creation progress
  const { provider, gameHandler, account } = useGame();

  const handleCreateContract = async () => {
    setIsCreating(true);
    console.log(account);
    try {
        const current_Contract = await gameHandler;
      const gameFactoryContract = await createGameFactoryContract(provider, current_Contract.address);
      // gameFactoryContract.connect(account.address.address);
      const myCall = gameFactoryContract.populate("new_game", [
        account,
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
      <Container>
        <Button
        variant="contained"
        style={{ backgroundColor: '#FFA500', color: '#fff' }}
        onClick={handleCreateContract}
        disabled={isCreating}
        startIcon={isCreating ? <CircularProgress size={20} /> : <AddCircleOutlineIcon />}
        sx={{
          width: '100%', // Full width of the container
          margin: '10px 0px', // Margin for spacing
          padding: '12px', // Padding for better visual appearance
          fontWeight: 'bold', // Bold font
        }}
        
      >
        {isCreating ? 'Creating New Game ...' : 'Create New Game'}
      </Button>
      </Container>

  );
}

export default GameFactoryButton;
