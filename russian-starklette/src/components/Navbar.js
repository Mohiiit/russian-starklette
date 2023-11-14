import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Container } from '@mui/material';
import { AccountBalance, AccountCircle } from '@mui/icons-material';



function Navbar({openAccountModal, openBalanceModal}) {

    

  return (
    <AppBar position="static"
    elevation={0} // Remove shadow
    sx={{
      background: 'transparent',
      borderBottom: '1px solid transparent', // Remove bottom border
    }}>
      <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Toolbar>
          <Typography variant="h6">Russian Starklette</Typography>
        </Toolbar>
        <Toolbar sx={{ marginLeft: 'auto' }}>
          <IconButton
            color="inherit"
            onClick={openBalanceModal}
            aria-controls="account-menu"
            aria-haspopup="true"
            sx={{ marginLeft: 1 }}
          >
            <AccountBalance />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={openAccountModal}
            aria-controls="account-menu"
            aria-haspopup="true"
            sx={{ marginLeft: 1 }}
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
