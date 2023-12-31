import React, { useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import OwnedGameModal from '../modals/OwnedGamesModal';
import OtherGamesModal from '../modals/OtherGamesModal';

const cardStyles = {
  minWidth: 275,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
};

const titleStyles = {
  fontSize: 18,
};

function GameCard({ contractAddress, ownership }) {
    const [gameModalOpen, setGameModalOpen] = useState(false);
  const [otherGamesModalOpen, setOtherGamesModalOpen] = useState(false);

  const handleGameModalOpen = () => {
    setGameModalOpen(true);
  };

  const handleGameModalClose = () => {
    setGameModalOpen(false);
  };

  const handleOtherGamesModalOpen = () => {
    setOtherGamesModalOpen(true);
  };

  const handleOtherGamesModalClose = () => {
    setOtherGamesModalOpen(false);
  };

  const handleCardClick = () => {
    if (ownership=='others') {
        handleOtherGamesModalOpen();
    } else {
        handleGameModalOpen();
    }
  }
  return (
    <div>
        <div onClick={handleCardClick}>
    <Card sx={cardStyles} variant="outlined">
      <CardContent>
        <Typography variant="h7" gutterBottom>
          Contract Address:
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {contractAddress}
        </Typography>
      </CardContent>
    </Card>
    </div>
    <OwnedGameModal open={gameModalOpen} handleClose={handleGameModalClose} contractAddress={contractAddress} />
      <OtherGamesModal open={otherGamesModalOpen} handleClose={handleOtherGamesModalClose} contractAddress={contractAddress} />
    </div>
  );
}

export default GameCard;
