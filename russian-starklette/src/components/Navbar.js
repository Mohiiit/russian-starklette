import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Menu, MenuItem } from '@mui/material';
import { AccountBalance, AccountCircle } from '@mui/icons-material';

function Navbar({openAccountModal}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = (event) => setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Russian Starklette
        </Typography>
        <IconButton
          color="inherit"
          onClick={openMenu}
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
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={closeMenu}
        >
          <MenuItem onClick={closeMenu}>Account Balance</MenuItem>
          <MenuItem onClick={closeMenu}>Account Address</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
