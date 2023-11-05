import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

function BalanceModal({ open, onClose, currentContract, provider }) {
  const [newBalance, setNewBalance] = useState('');
  const [balance, setBalance] = useState(0);
  const getPlayerBalance = async () => {
    const response = await currentContract?.get_player_balance('0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973');
    setBalance(response?.toString());
  };

  const handleUpdateBalance = async() => {
    if (newBalance<=0) {
        await decreasePlayerBalance(Math.abs(newBalance));
    } else {
        await increasePlayerBalance(newBalance);
    }
    await getPlayerBalance();
  };
  const increasePlayerBalance = async (amount) => {
    const myCall = currentContract.populate("increase_player_balance", [
      '0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973', amount
    ]);
    const res = await currentContract.increase_player_balance(myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
    // await getPlayerBalance();
  };

  

  const decreasePlayerBalance = async (amount) => {
    const myCall = currentContract.populate("decrease_player_balance", [
      '0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973', amount
    ]);
    const res = await currentContract.decrease_player_balance(myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
    // await getPlayerBalance();
  };

  useEffect(() => {
    getPlayerBalance();
  }, [])

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
