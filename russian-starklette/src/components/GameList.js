import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  useMediaQuery,
  Grid,
  Box,
  TextField
} from '@mui/material';
import GameCard from './GameCard';
import SearchIcon from '@mui/icons-material/Search';


function GameLists({ ownedGames, otherGames }) {
  const [ownedGamesFilter, setOwnedGamesFilter] = useState('');
  const [otherGamesFilter, setOtherGamesFilter] = useState('');
  const isLargeScreen = useMediaQuery('(min-width:600px)');
  
  const filterGames = (games, filter) => {
    return games.filter((game) => game.includes(filter));
  };

  const filteredOwnedGames = filterGames(ownedGames, ownedGamesFilter);
  const filteredOtherGames = filterGames(otherGames, otherGamesFilter);

  return (
    <Container padding={1} maxHeight='75%'>
      <Grid container spacing={2} direction="row">
        <Grid item xs={12} sm={6} md={4} overflow="hidden">
          
          <Box
          border={1}
          borderColor="#fff"
            borderRadius={2}
            padding={2}
            marginBottom={2}
            overflow='auto'
            height='75vh'
            scroll="hide"
          >
            <TextField
              label="Your Games"
              variant="outlined"
              fullWidth
              value={ownedGamesFilter}
              onChange={(e) => setOwnedGamesFilter(e.target.value)}
              style={{
                marginBottom: '16px',
                color: '#fff',
                position: 'sticky', // Stick at the top
                top: 0, // Stick at the top
                zIndex: 1, // Stick at the top
                backgroundColor: '#111', // Dark background for sticky effect
              }}
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
            <Grid container spacing={2} direction="row">
              {filteredOwnedGames.map((game) => (
                <Grid item xs={12} key={game}>
                  <GameCard
                    contractAddress={game}
                    ownership='self'
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={8}>
          
          <Box
            border={1}
            borderColor="#fff"
            borderRadius={2}
            padding={2}
            marginBottom={2}
            overflow='auto'
            height='75vh'
            scroll="hide"
          >
            <TextField
              label="Other Games"
              variant="outlined"
              fullWidth
              value={otherGamesFilter}
              onChange={(e) => setOtherGamesFilter(e.target.value)}
              style={{
                marginBottom: '16px',
                color: '#fff',
                position: 'sticky', // Stick at the top
                top: 0, // Stick at the top
                zIndex: 1, // Stick at the top
                backgroundColor: '#111', // Dark background for sticky effect
              }}
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
            <Grid container spacing={2} direction="row">
              {filteredOtherGames.map((game) => (
                <Grid item xs={12} sm={6} md={6} key={game}>
                  <GameCard
                    contractAddress={game}
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
