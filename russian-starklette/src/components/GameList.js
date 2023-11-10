import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  useMediaQuery,
  Grid,
  Box,
} from '@mui/material';
import GameCard from './GameCard';
import { createGameFactoryContract } from '../utils';
import { useAccount } from '../context/AccountContext';
import { useGame } from '../context/ProviderContext';

function GameLists({ ownedGames, otherGames }) {
  const isLargeScreen = useMediaQuery('(min-width:600px)');
  const {account} = useAccount();
  const {provider, gameHandler} = useGame();
  const [allGames, setAllGames] = useState([]);

  async function getOneGame() {
    
  }
  

  return (
    <Container padding={1}>
      <Grid container spacing={2} direction="row">
        <Grid item xs={12} sm={6} md={4} overflow={'hidden'}>
        <Typography variant="h4" gutterBottom>
              Your Games
            </Typography>
          <Box
            border={1}
            borderColor="primary.main"
            borderRadius={2}
            padding={2}
            marginBottom={2}
            maxHeight={isLargeScreen ? '60%' : '45%'}
            overflow={isLargeScreen ? 'auto' : 'auto'}
            scroll={'hide'}
          >
            
            <Grid container spacing={2} direction="column">
            {ownedGames.map((game) => (
              <Grid item xs={12} key={game.contractAddress}>
                <GameCard
                  contractAddress={game.contractAddress}
                  ownership='self'
                />
              </Grid>
            ))}
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={8}>
        <Typography variant="h4" gutterBottom>
              Other Gamess
            </Typography>
          <Box
            border={1}
            borderColor="primary.main"
            borderRadius={2}
            padding={2}
            marginBottom={2}
            maxHeight={isLargeScreen ? '60%' : '45%'}
            overflow={isLargeScreen ? 'auto' : 'auto'}
            scroll={'hide'}
          >
            
            <Grid container spacing={2} direction="row">
            {otherGames.map((game) => (
              <Grid item xs={12} sm={6} md={6} key={game.contractAddress}>
                <GameCard
                  contractAddress={game.contractAddress}
                  ownership='others'
                />
              </Grid>
            ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
      
    </Container>
  );
}

export default GameLists;
