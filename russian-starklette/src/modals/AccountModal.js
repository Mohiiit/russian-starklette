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

import { useGame } from '../context/ProviderContext';

function AccountModal({ open, onClose }) {
  const [showAddAccountForm, setShowAddAccountForm] = useState(false);
  const [accountAddress, setAccountAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [activeAccount, setActiveAccount] = useState(localStorage.getItem('address'));
  const [isConnected, setIsConnected] = useState(false);

  const {provider, connectWallet, disconnectWallet, setNewAccount} = useGame();

  const handleAddAccount = () => {
    setNewAccount({address: accountAddress});
  };

  // useEffect(() => {
  //   const address = localStorage.getItem('address');

  //   if (address) {
  //       setNewAccount({address: address});
  //   }

  // }, [provider]);

  return (
    <Dialog open={open} onClose={onClose}>
      {
        isConnected ? (
          <>
          <DialogTitle>Connected</DialogTitle>
          <p><button onClick={()=> {disconnectWallet()}}>Disconnect</button></p>
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
          </>
        ) : (
          <div>
          <span>Choose a wallet:</span>
          <p>
            <button onClick={() => connectWallet()}>Connect a Wallet</button>
          </p>
        </div>
        )
      }
      
    </Dialog>
  );
}

export default AccountModal;
