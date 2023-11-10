import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  TextField,
  Box,
} from '@mui/material';

function OtherGamesModal({ open, handleClose }) {
  const [gameStarted, setGameStarted] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [betNumber, setBetNumber] = useState(0);

  const placeBet = (amount, number) => {
    setBetAmount(amount);
    setBetNumber(number);
    setBetPlaced(true);
  };

  const updateBet = (amount, number) => {
    setBetAmount(amount);
    setBetNumber(number);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Game Status</DialogTitle>
      <DialogContent>
        {gameStarted ? (
          gameEnded ? (
            <DialogContentText>Game Over</DialogContentText>
          ) : (
            <div>
              {betPlaced ? (
                <div>
                  <DialogContentText>Bet Placed</DialogContentText>
                  <DialogContentText>Bet Amount: {betAmount} ETH</DialogContentText>
                  <DialogContentText>Bet Number: {betNumber}</DialogContentText>
                  <TextField
                    label="Update Amount"
                    variant="outlined"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                  />
                  <DialogActions>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => updateBet(betAmount, betNumber)}
                    >
                      Update Amount
                    </Button>
                  </DialogActions>
                  <TextField
                    label="Update Number"
                    variant="outlined"
                    value={betNumber}
                    onChange={(e) => setBetNumber(e.target.value)}
                  />
                  <DialogActions>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => updateBet(betAmount, betNumber)}
                    >
                      Update Number
                    </Button>
                  </DialogActions>
                </div>
              ) : (
                <div>
                  <DialogContentText>No Bet Placed Yet</DialogContentText>
                  <TextField
                    label="Amount"
                    variant="outlined"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                  />
                  <TextField
                    label="Number"
                    variant="outlined"
                    value={betNumber}
                    onChange={(e) => setBetNumber(e.target.value)}
                  />
                  <DialogActions>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => placeBet(betAmount, betNumber)}
                    >
                      Place Bet
                    </Button>
                  </DialogActions>
                </div>
              )}
            </div>
          )
        ) : (
          <DialogContentText>Game Not Started Yet</DialogContentText>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default OtherGamesModal;
