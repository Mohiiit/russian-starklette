import React, { useEffect, useState } from 'react';
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
import { useGame } from '../context/ProviderContext';
import { useAccount } from '../context/AccountContext';
import { createGameFactoryContract, placeBet } from '../utils';

function OwnedGameModal({ open, handleClose, contractAddress }) {
  const { setGameProviderInstance , updateGameHandler, updateGameHandlerAddress, provider, gameHandler} = useGame();
  const {account} = useAccount();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [betNumber, setBetNumber] = useState(0);
  const [luckyNumber, setLuckyNumber] = useState(0);

  const startGame = async() => {
    const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
    gameFactoryContract.connect(account);
    const response = await gameFactoryContract.start_game();
    console.log(response);
    setGameStarted(true);
  };

  const endGame = () => {
    setGameEnded(true);
    const randomNumber = Math.floor(Math.random() * 100); // Replace with your logic to determine the lucky number
    setLuckyNumber(randomNumber);
  };

  const placeBets = async(amount, number) => {
    await placeBet(provider, contractAddress, account, number, amount);
  };

  async function preCheck() {
    const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
    const formatAnswer = { game_id: 'string', game_owner: 'string' , game_status: 'string', game_winning_number: 'string'};
    const res = await gameFactoryContract.get_game({
      parseRequest: true,
      parseResponse: true,
      formatResponse: formatAnswer,
  });
    console.log(res.game_status);
    if (res.game_status == 'ONGOING') {
      setGameStarted(true);
    }
  }


  useEffect(() => {
    if(open) {
      preCheck();
    }
  }, [open]);

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
