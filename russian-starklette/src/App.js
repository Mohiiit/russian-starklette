import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import { GameProvider } from './context/ProviderContext';
import { useMediaQuery, Container, Typography, useTheme, CssBaseline } from '@mui/material';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import MonitorIcon from '@mui/icons-material/Monitor';

function App() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <GameProvider>
      <CssBaseline /> 
      {isSmallScreen ? (
        // Render a component for smaller screens
        <Container
          sx={{
            background: 'linear-gradient(to bottom, #20004f, #000000)',
            color: '#fff',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <LaptopMacIcon sx={{ fontSize: 80, marginRight: 2 }} />
            <MonitorIcon sx={{ fontSize: 80, marginLeft: 2 }} />
          </div>
          <div
            sx={{
              backgroundColor: '#111',
            color: '#fff',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
            }}
          >
            <Typography variant="h4" gutterBottom sx={{fontFamily: 'Roboto',}}>
              Sorry, the current support is for bigger screens.
            </Typography>
            <Typography sx={{fontFamily: 'Roboto',}}>
              Please open this lovely site on a larger screen for the best experience.
            </Typography>
            
          </div>
        </Container>
      ) : (
        <>
          <div>
            <Home />
          </div>
        </>
      )}
    </GameProvider>
  );
}

export default App;
