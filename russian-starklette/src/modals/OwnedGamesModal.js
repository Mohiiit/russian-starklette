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
  TextField
} from '@mui/material';
import { useGame } from '../context/ProviderContext';
import { createGameFactoryContract, getBalance, placeBet, updateAmount, updateNumber } from '../utils';

function OwnedGameModal({ open, handleClose, contractAddress }) {
  const { setGameProviderInstance , updateGameHandler, updateGameHandlerAddress, provider, gameHandler, account, balance, setBalance} = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [betNumber, setBetNumber] = useState(0);
  const [luckyNumber, setLuckyNumber] = useState(0);
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [updateAmountVisible, setUpdateAmountVisible] = useState(false);
  const [updateNumberVisible, setUpdateNumberVisible] = useState(false);
  const [newBetAmount, setNewBetAmount] = useState('');
  const [newBetNumber, setNewBetNumber] = useState('');

  const startGame = async() => {
    const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
    // console.log(account.address.address)
    // gameFactoryContract.connect(account.address.address);
    const response = await gameFactoryContract.start_game();
    console.log(response);
    setGameStarted(true);
  };

  async function endGame() {
    const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
    // gameFactoryContract.connect(account.address);
    const res = await gameFactoryContract.end_game();
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
    await preCheck();
  };

  const updateBetNumber = async() => {
    const parsedNumber =  (parseInt(newBetNumber, 10));
    await updateNumber(provider, contractAddress, account, parsedNumber);
    setUpdateNumberVisible(false);
    await checkBetStatus();
  };

  const updateBetAmount = async() => {
    const parsedAmount = (parseInt(newBetAmount, 10));
    await updateAmount(provider, contractAddress, account, parsedAmount);
    setUpdateAmountVisible(false);
    await checkBetStatus();
  };

  const placeBets = async() => {
    const parsedNumber = parseInt(number, 10);
    const parsedAmount = parseInt(amount, 10);
    await placeBet(provider, contractAddress, account, parsedNumber, parsedAmount);
    await checkBetStatus();
  };

  async function preCheck() {
    const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
    const formatGameStatus = { game_id: 'number', game_owner: 'string' , game_status: 'string', game_winning_number: 'number'};
    const gameStatus = await gameFactoryContract.get_game({
      parseRequest: true,
      parseResponse: true,
      formatResponse: formatGameStatus,
  });
    console.log(gameStatus);
    if (gameStatus.game_status == 'ONGOING') {
      setGameStarted(true);
    } else if(gameStatus.game_status == 'ENDED') {
      setGameEnded(true);
      setLuckyNumber(gameStatus.game_winning_number);
    }
    await checkBetStatus();
    
  }

  async function checkBetStatus() {
    const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
    const formatBetStatus = {bet_status: 'string', current_amount: 'number', current_number: 'number'};
    const betStatus = await gameFactoryContract.get_player_bet(account, {
      parseRequest: true,
      parseResponse: true,
      formatResponse: formatBetStatus,
  });

  console.log(betStatus);

  if (betStatus.bet_status=='PLACED') {
    setBetPlaced(true);
    setBetAmount(betStatus.current_amount);
    setBetNumber(betStatus.current_number);
  }
  const currentContract = await gameHandler;
  await getBalance(provider, currentContract.address,account, setBalance);
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
                <DialogContentText>Bet Amount: {betAmount} ETH</DialogContentText>
                  <DialogContentText>Bet Number: {betNumber}</DialogContentText>
              </div>
            ) : (
              <div>
                {betPlaced ? (
                  <div>
                  <DialogContentText>Bet Placed</DialogContentText>
                  <DialogContentText>Bet Amount: {betAmount} ETH</DialogContentText>
                  <DialogContentText>Bet Number: {betNumber}</DialogContentText>
            
                  {/* Update Number section */}
                  {updateNumberVisible ? (
                    <div>
                      <TextField
                        label="New Bet Number"
                        variant="outlined"
                        fullWidth
                        value={newBetNumber}
                        onChange={(e) => setNewBetNumber(e.target.value)}
                        margin="dense"
                        type="number"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={updateBetNumber}
                      >
                        Update Number
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setUpdateNumberVisible(true)}
                    >
                      Update Number
                    </Button>
                  )}
            
                  {/* Update Amount section */}
                  {updateAmountVisible ? (
                    <div>
                      <TextField
                        label="New Bet Amount"
                        variant="outlined"
                        fullWidth
                        value={newBetAmount}
                        onChange={(e) => setNewBetAmount(e.target.value)}
                        margin="dense"
                        type="number"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={updateBetAmount}
                      >
                        Update Amount
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setUpdateAmountVisible(true)}
                    >
                      Update Amount
                    </Button>
                  )}
            
                  {/* End Game button */}
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
      <DialogContent>
        <Typography>Current Balance: {balance}</Typography>
        <TextField
          label="Number"
          variant="outlined"
          fullWidth
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          margin="dense"
        />
        <TextField
          label="Amount"
          variant="outlined"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={placeBets}
          disabled={!number || !amount} // Disable the button if either input is empty
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
