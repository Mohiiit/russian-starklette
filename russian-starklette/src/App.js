import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import { GameProvider } from './context/ProviderContext';
import { AccountProvider } from './context/AccountContext';

function App() {
  return (
    <GameProvider>
    <AccountProvider>
    <div className="App">
      <Home />
    </div>
    </AccountProvider>
    </GameProvider>
  );
}

export default App;
