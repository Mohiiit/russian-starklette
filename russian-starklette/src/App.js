import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import { GameProvider } from './context/ProviderContext';

function App() {
  return (
    <GameProvider>
    <div className="App">
      <Home />
    </div>
    </GameProvider>
  );
}

export default App;
