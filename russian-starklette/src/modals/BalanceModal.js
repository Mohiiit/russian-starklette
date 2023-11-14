import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, CircularProgress, Backdrop } from '@mui/material';
import { useGame } from '../context/ProviderContext';
import { createGameFactoryContract, getBalance } from '../utils';

const styles = {
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
  },
  textField: {
    margin: '8px 0',
  },
  button: {
    margin: '8px 0',
    position: 'relative',
    width: '100%'
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
};



function BalanceModal({ open, onClose }) {
  const {provider, gameHandler, account, balance, setBalance} = useGame();
  const [newBalance, setNewBalance] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  // const [balance, setBalance] = useState(0);

  const getPlayerBalance = async () => {
    const current_Contract = await gameHandler;
    console.log(account);
    await getBalance(provider, current_Contract.address, account, setBalance);
  };

  const handleUpdateBalance = async () => {
    setIsUpdating(true);

    try {
      if (newBalance <= 0) {
        await decreasePlayerBalance(Math.abs(newBalance));
      } else {
        await increasePlayerBalance(newBalance);
      }
     
      await getPlayerBalance();
      
    } catch (error) {
      console.log(error);
      setIsUpdating(false);
      setNewBalance('');
    } finally {
      setIsUpdating(false);
      setNewBalance('');
    }
  };
  const increasePlayerBalance = async (amount) => {
    const current_Contract = await gameHandler;
    const gameFactoryContract = await createGameFactoryContract(provider, current_Contract.address);
    // gameFactoryContract.connect(account);
    const myCall = gameFactoryContract.populate("increase_player_balance", [
        account, amount
    ]);
    const res = await gameFactoryContract.increase_player_balance(myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
    // await getPlayerBalance();
  };

  

  const decreasePlayerBalance = async (amount) => {
    const current_Contract = await gameHandler;
    const gameFactoryContract = await createGameFactoryContract(provider, current_Contract.address);
    gameFactoryContract.connect(account);
    const myCall = gameFactoryContract.populate("increase_player_balance", [
        account.address, amount
    ]);
    const res = await gameFactoryContract.decrease_player_balance(myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
    // await getPlayerBalance();
  };

  useEffect(() => {
    if(provider && gameHandler && account) {
        getPlayerBalance();
    }
  }, [provider, gameHandler, account])

  return (
    <Dialog 
    open={open}
    onClose={onClose}
    BackdropComponent={Backdrop}
    BackdropProps={{ sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
    >
      <DialogTitle sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>Bank</DialogTitle>
      <DialogContent sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
        <Typography variant="body1" gutterBottom>
          <strong>Current Balance: {balance}</strong>
        </Typography>
        <TextField
          label="New Balance"
          variant="outlined"
          fullWidth
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
          sx={{
            backgroundColor: '#222', // Dark background for TextField
            '& input': {
              color: '#fff', // White text for input
            },
            '& label': {
              color: '#888', // Grey color for label
            },
            marginTop: '5px'
          }}
        />
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant="contained"
          style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }} 
          onClick={handleUpdateBalance}
          disabled={isUpdating}
          startIcon={isUpdating ? <CircularProgress size={20} /> : null}
        >
          {isUpdating ? 'Updating Balance ...' : 'Update Balance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BalanceModal;
