import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    Account,
    Provider,
    Contract,
    RpcProvider,
    shortString,
    cairo,
    stark,
  } from "starknet";
  import { connect, disconnect } from "get-starknet"
  import { getBalance } from '../utils';


// Create a context for the game provider and game handler
const GameContext = createContext();

// Create a custom hook to access the game context
export function useGame() {
  return useContext(GameContext);
}

// GameProvider component to provide the game provider and game handler
export function GameProvider({ children }) {
  // Initialize the game provider and handler here
  const [provider, setProvider] = useState(null);
  const [gameHandler, setGameHandler] = useState(null);
  const [gameHandlerAddress, setGameHandlerAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);

  const disconnectWallet = async () => {
    try {
      await disconnect({ clearLastWallet: true })
      setProvider()
      setIsConnected(false)
    }
    catch (error) {
      alert(error.message)
    }
  }

  const connectWallet = async () => {
    try {
      const starknet = await connect()
      if (!starknet) throw new Error("Failed to connect to wallet.")
      await starknet.enable({ starknetVersion: "v5" })
      setProvider(starknet.account)
      console.log(starknet.selectedAddress);
      setAccount(starknet.selectedAddress);
      setIsConnected(true)
    }
    catch (error) {
      alert(error.message)
    }
  }
  // Function to set the game provider
  const setGameProviderInstance = (gameProvider) => {
    setProvider(gameProvider);
  };

  // Function to update the game handler
  const updateGameHandler = (newHandler) => {
    setGameHandler(newHandler);
  };

  const updateGameHandlerAddress = (newAddress) => {
    setGameHandlerAddress(newAddress);
  }

  const setGameHandlerAddressFunction = async(currProvider, gameFactoryContractAddress) => {
    updateGameHandlerAddress(gameFactoryContractAddress);
    const { abi: gameFactoryAbi } = await currProvider.getClassAt(gameFactoryContractAddress);
    if (gameFactoryAbi === undefined) {
      throw new Error("no abi.");
    }
    const gameFactoryContract = new Contract(gameFactoryAbi, gameFactoryContractAddress, provider);
    return gameFactoryContract;
  }

  useEffect(() => {
    // const currProvider = new RpcProvider({ sequencer: { baseUrl: "http://0.0.0.0:5050" } });
    // setGameProviderInstance(currProvider);
    if(provider) {
      console.log('in', provider)
      const gameFactoryContractAddress = '0x019032c77ed45efa58e15b5a9cab53d222789c9ef501dcbfce25d76d9a940c38';
    const gameFactoryContract = setGameHandlerAddressFunction(provider, gameFactoryContractAddress);
    updateGameHandler(gameFactoryContract);
    console.log(provider, gameFactoryContract);
    }
  }, [provider, isConnected]);

  async function getBalances() {
    const current_Contract = await gameHandler;
    console.log(provider, current_Contract.address, provider.address);
    await getBalance(provider, current_Contract.address, provider.address, setBalance);
  }

  useEffect(() => {
    if(account && provider && gameHandler) {
      getBalances();
    }
  }, [account]);

  return (
    <GameContext.Provider value={{ provider, setGameProviderInstance, gameHandler, updateGameHandler, gameHandlerAddress, updateGameHandlerAddress, connectWallet, disconnectWallet, setBalance, setAccount, account, balance, isConnected }}>
      {children}
    </GameContext.Provider>
  );
}
