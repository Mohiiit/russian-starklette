import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slide,
} from '@mui/material';

import { useAccount } from '../context/AccountContext';
import { useGame } from '../context/ProviderContext';

function AccountModal({ open, onClose }) {
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [activeAccount, setActiveAccount] = useState(localStorage.getItem('address'));

  const {account, setNewAccount} = useAccount();
  const {provider} = useGame();

  const handleAddAccount = () => {
    setNewAccount(accountAddress, privateKey);
  };

  useEffect(() => {
    const address = localStorage.getItem('address');
    const key = localStorage.getItem('key');

    if (address && key) {
        setNewAccount(address, key);
    }

  }, [provider]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Account Modal</DialogTitle>
      <DialogContent>
        <div>
          <strong>Active Account:</strong> {activeAccount}
        </div>
        <Button
          variant="outlined"
          onClick={() => setShowAddAccountForm(!showAddAccountForm)}
        >
          Add New Account
        </Button>
        {showAddAccountForm && <Slide direction="up" in={showAddAccountForm}>
          <div>
            <TextField
              label="Account Address"
              variant="outlined"
              fullWidth
              value={accountAddress}
              onChange={(e) => setAccountAddress(e.target.value)}
            />
            <TextField
              label="Private Key"
              variant="outlined"
              fullWidth
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAccount}
            >
              Add New Account
            </Button>
          </div>
        </Slide>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AccountModal;
