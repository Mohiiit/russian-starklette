import React, { useState } from 'react';
import { Button, List, ListItem, ListItemText } from '@mui/material';

const GameList = ({allGames, setCurrentGameContractFun}) => {
  const [selectedOption, setSelectedOption] = useState('');

//   const addresses = ['Address 1', 'Address 2', 'Address 3', 'Address 4']; // Replace with your array of addresses

  const handleOptionClick = (address) => {
    setCurrentGameContractFun(address);
    setSelectedOption(address);
  };

  return (
    <div>
      <List>
        {allGames?.map((address, index) => (
          <ListItem
            key={index}
            button
            onClick={() => handleOptionClick(address)}
          >
            <ListItemText primary={address} />
          </ListItem>
        ))}
      </List>
      <div>
        <strong>Selected Option:</strong> {selectedOption}
      </div>
    </div>
  );
};

export default GameList;
