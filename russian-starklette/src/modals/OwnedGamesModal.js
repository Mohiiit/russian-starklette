import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box,
} from '@mui/material';

function OwnedGameModal({ open, handleClose }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [betNumber, setBetNumber] = useState(0);
  const [luckyNumber, setLuckyNumber] = useState(0);

  const startGame = () => {
    setGameStarted(true);
  };

  const endGame = () => {
    setGameEnded(true);
    const randomNumber = Math.floor(Math.random() * 100); // Replace with your logic to determine the lucky number
    setLuckyNumber(randomNumber);
  };

  const placeBet = (amount, number) => {
    setBetAmount(amount);
    setBetNumber(number);
    setBetPlaced(true);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Game Status</DialogTitle>
      <DialogContent>
        {gameStarted ? (
          <div>
            {gameEnded ? (
              <div>
                <DialogContentText>Game Ended</DialogContentText>
                <Typography variant="h6" gutterBottom>
                  Lucky Number: {luckyNumber}
                </Typography>
              </div>
            ) : (
              <div>
                {betPlaced ? (
                  <div>
                    <DialogContentText>Bet Placed</DialogContentText>
                    <DialogContentText>
                      Bet Amount: {betAmount} ETH
                    </DialogContentText>
                    <DialogContentText>
                      Bet Number: {betNumber}
                    </DialogContentText>
                    <DialogActions>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={endGame}
                      >
                        End Game
                      </Button>
                    </DialogActions>
                  </div>
                ) : (
                  <div>
                    <DialogContentText>No Bet Placed Yet</DialogContentText>
                    <DialogActions>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => placeBet(10, 42)}
                      >
                        Place Bet
                      </Button>
                    </DialogActions>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <DialogContentText>Game Not Started Yet</DialogContentText>
            <DialogActions>
              <Button variant="contained" color="primary" onClick={startGame}>
                Start Game
              </Button>
            </DialogActions>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default OwnedGameModal;
