import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useAccount } from '../context/AccountContext';
import { useGame } from '../context/ProviderContext';

import { createGameFactoryContract } from '../utils';
function BalanceModal({ open, onClose }) {
    const {account, balance, setBalance} = useAccount();
  const {provider, gameHandler} = useGame();
  const [newBalance, setNewBalance] = useState('');
  // const [balance, setBalance] = useState(0);

  const getPlayerBalance = async () => {
    const current_Contract = await gameHandler;
    const gameFactoryContract = await createGameFactoryContract(provider, current_Contract.address);
    const response = await gameFactoryContract.get_player_balance(account.address);
    setBalance(response?.toString());
  };

  const handleUpdateBalance = async() => {
    if (newBalance<=0) {
        await decreasePlayerBalance(Math.abs(newBalance));
    } else {
        await increasePlayerBalance(newBalance);
    }
    // await getPlayerBalance();
  };
  const increasePlayerBalance = async (amount) => {
    const current_Contract = await gameHandler;
    const gameFactoryContract = await createGameFactoryContract(provider, current_Contract.address);
    gameFactoryContract.connect(account);
    const myCall = gameFactoryContract.populate("increase_player_balance", [
        account.address, amount
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
    if(provider) {
        getPlayerBalance();
    }
  }, [provider])

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Balance Modal</DialogTitle>
      <DialogContent>
        <div>
          <strong>Current Balance: {balance}</strong>
        </div>
        <TextField
          label="New Balance"
          variant="outlined"
          fullWidth
          value={newBalance}
          onChange={(e) => setNewBalance(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateBalance}
        >
          Update Balance
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BalanceModal;
