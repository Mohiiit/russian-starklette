import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

function AccountModal({ open, onClose }) {
  const [accountAddress, setAccountAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [activeAccount, setActiveAccount] = useState(localStorage.getItem('activeAccount'));

  const handleAddAccount = () => {
    // Handle adding a new account here
    // You can save the new account data to local storage and set it as the active account
    localStorage.setItem('activeAccount', accountAddress);
    setActiveAccount(accountAddress);
    setAccountAddress('');
    setPrivateKey('');
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Account Modal</DialogTitle>
      <DialogContent>
        <div>
          <strong>Active Account:</strong> {activeAccount}
        </div>
        <Button variant="outlined" onClick={handleAddAccount}>
          Add New Account
        </Button>
        {activeAccount && (
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
        )}
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
