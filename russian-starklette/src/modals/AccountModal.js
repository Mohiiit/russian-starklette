import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  Backdrop,
} from '@mui/material';import { useGame } from '../context/ProviderContext';

const styles = {
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
  },
  loader: {
    margin: '8px',
  },
  button: {
    marginTop: '16px',
  },
};



function AccountModal({ open, onClose }) {

  const {provider, connectWallet, disconnectWallet, setNewAccount, isConnected, account} = useGame();
  

  return  (
    <Dialog
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}
    >
      {isConnected ? (
        <>
          <DialogTitle>Connected</DialogTitle>
          <DialogContent sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
            <Typography variant="body1" gutterBottom>
              <strong>Active Account:</strong> {account}
            </Typography>
            <Button
              variant="contained"
              style={{ backgroundColor: '#FFA500', color: '#fff' }} // Darkish orange background
              onClick={() => disconnectWallet()}
              sx={{ marginTop: 2 }}
            >
              Disconnect
            </Button>
          </DialogContent>
        </>
      ) : (
        <DialogContent sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Choose a wallet
          </Typography>
          <Button
            variant="contained"
            style={{ backgroundColor: '#FFA500', color: '#fff' }} // Darkish orange background
            onClick={() => connectWallet()}
            sx={{ marginTop: 2 }}
          >
            Connect a Wallet
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default AccountModal;
