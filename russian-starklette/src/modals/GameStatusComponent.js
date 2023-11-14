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


function GameStatusComponent({open, contractAddress, setGameStarted, setGameEnded, setLuckyNumber, ownership}) {
    const { setGameProviderInstance , updateGameHandler, updateGameHandlerAddress, provider, gameHandler, account, balance, setBalance} = useGame();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [localwin, setLocalwin] = useState('');
    async function checkGameStatus() {
        const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
        const formatGameStatus = { game_id: 'number', game_owner: 'string' , game_status: 'string', game_winning_number: 'number'};
        const gameStatus = await gameFactoryContract.get_game({
          parseRequest: true,
          parseResponse: true,
          formatResponse: formatGameStatus,
    });
        setStatus(gameStatus.game_status);
        setLocalwin(gameStatus.game_winning_number);
        if (gameStatus.game_status == 'ONGOING') {
          setGameStarted(true);
        } else if(gameStatus.game_status == 'ENDED') {
          setGameEnded(true);
          setLuckyNumber(gameStatus.game_winning_number);
        }
        
    }
    const startGame = async() => {
        const gameFactoryContract = await createGameFactoryContract(provider, contractAddress);
        const response = await gameFactoryContract.start_game();
        setGameStarted(true);
      };

    useEffect(() => {
        if(open) {
            setLoading(true);
          checkGameStatus();
          setLoading(false);
        }
    }, [open]);
    
    return (
        <>
        {loading ? (
            <>fetching game status now</>
        ): (
            <>
            {status==='ENDED' && (
                <>
                    <DialogContentText  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Game Ended</DialogContentText>
                    <DialogContentText  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Lucky Number: {localwin}</DialogContentText>
                </>
            )}
            {status==='NOT_STARTED' && ownership=='self' && (
                <div>
                <DialogContentText sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>Game Not Started Yet</DialogContentText>
                <DialogActions  sx={{ backgroundColor: '#111', color: '#fff', textAlign: 'center' }}>
                  <Button variant="contained" style={{ backgroundColor: '#FFA500', color: '#fff', marginBottom: '5px' }}  onClick={startGame}>
                    Start Game
                  </Button>
                </DialogActions>
              </div>
            )}
            </>
        )}

        </>
    );
}

export default GameStatusComponent;