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
  TextField, Backdrop
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
    <Dialog open={open} onClose={handleClose} BackdropComponent={Backdrop}
    BackdropProps={{ sx: { backdropFilter: 'blur(2px)', backgroundColor: 'rgba(0, 0, 0, 0.5)' } }}>
      <DialogTitle  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>Game Status</DialogTitle>
      <DialogContent  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
        {gameStarted ? (
          <div>
            {gameEnded ? (
              <div>
                <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Game Ended</DialogContentText>
                <Typography variant="h6" gutterBottom>
                  Lucky Number: {luckyNumber}
                </Typography>
                <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Bet Amount: {betAmount} ETH</DialogContentText>
                  <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Bet Number: {betNumber}</DialogContentText>
              </div>
            ) : (
              <div>
                {betPlaced ? (
                  <div>
                  <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Bet Placed</DialogContentText>
                  <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Bet Amount: {betAmount} ETH</DialogContentText>
                  <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Bet Number: {betNumber}</DialogContentText>
            
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
                        sx={{
                          backgroundColor: '#222', // Dark background for TextField
                          '& input': {
                            color: '#fff', // White text for input
                          },
                          '& label': {
                            color: '#888', // Grey color for label
                          },
                          marginTop: '5px'
                        }}
                      />
                      <Button
                        variant="contained"
                        style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }} 
                        onClick={updateBetNumber}
                      >
                        Update Number
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="contained"
                      style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }} 
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
                        sx={{
                          backgroundColor: '#222', // Dark background for TextField
                          '& input': {
                            color: '#fff', // White text for input
                          },
                          '& label': {
                            color: '#888', // Grey color for label
                          },
                          marginTop: '5px'
                        }}
                      />
                      <Button
                        variant="contained"
                        style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }} 
                        onClick={updateBetAmount}
                      >
                        Update Amount
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="contained"
                      style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }} 
                      onClick={() => setUpdateAmountVisible(true)}
                    >
                      Update Amount
                    </Button>
                  )}
            
                  {/* End Game button */}
                  <DialogActions>
                    <Button
                      variant="contained"
                      style={{ backgroundColor: '#FFA510', color: '#fff', marginBottom: '5px' }} 
                      onClick={endGame}
                    >
                      End Game
                    </Button>
                  </DialogActions>
                </div>
                ) : (
                  <div>
      <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>No Bet Placed Yet</DialogContentText>
      <DialogContent  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
        <Typography>Current Balance: {balance}</Typography>
        <TextField
          label="Number"
          variant="outlined"
          fullWidth
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          margin="dense"
          type="number"
          sx={{
            backgroundColor: '#222', // Dark background for TextField
            '& input': {
              color: '#fff', // White text for input
            },
            '& label': {
              color: '#888', // Grey color for label
            },
            marginTop: '5px'
          }}
        />
        <TextField
          label="Amount"
          variant="outlined"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="dense"
          type="number"
          sx={{
            backgroundColor: '#222', // Dark background for TextField
            '& input': {
              color: '#fff', // White text for input
            },
            '& label': {
              color: '#888', // Grey color for label
            },
            marginTop: '5px'
          }}
        />
      </DialogContent>
      <DialogActions  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
        <Button
          variant="contained"
          style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }} 
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
            <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Game Not Started Yet</DialogContentText>
            <DialogActions  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
              <Button variant="contained" style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }}  onClick={startGame}>
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
