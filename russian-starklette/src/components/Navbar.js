import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Menu, MenuItem } from '@mui/material';
import { AccountBalance, AccountCircle } from '@mui/icons-material';

function Navbar({openAccountModal, openBalanceModal}) {

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Russian Starklette
        </Typography>
        <IconButton
          color="inherit"
          onClick={openBalanceModal}
          aria-controls="account-menu"
          aria-haspopup="true"
        >
          <AccountBalance />
        </IconButton>
        <IconButton
          color="inherit"
          onClick={() => openAccountModal()} // Open the modal when the account icon is clicked
          aria-controls="account-menu"
          aria-haspopup="true"
        >
          <AccountCircle />
        </IconButton>
        
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
