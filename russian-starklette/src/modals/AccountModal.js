import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, CircularProgress, Typography } from '@mui/material';
import { useGame } from '../context/ProviderContext';

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
    <Dialog open={open} onClose={onClose}>
      {isConnected ? (
        <>
          <DialogTitle>Connected</DialogTitle>
          <DialogContent style={styles.dialogContent}>
            <Typography variant="body1" gutterBottom>
              <strong>Active Account:</strong> {account}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => disconnectWallet()}
              style={styles.loader}
            >
              Disconnect
            </Button>
          </DialogContent>
        </>
      ) : (
        <DialogContent style={styles.dialogContent}>
          <Typography variant="h6" gutterBottom>
            Choose a wallet
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => connectWallet()}
            style={{ ...styles.loader, ...styles.button }}
          >
            Connect a Wallet
          </Button>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default AccountModal;
