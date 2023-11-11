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
    const currProvider = new RpcProvider({ sequencer: { baseUrl: "http://0.0.0.0:5050" } });
    setGameProviderInstance(currProvider);
    const gameFactoryContractAddress = '0x053c7200cd634be3547315bedf977e2ff116ebe7be4307d7f18c99d629b78ace';
    const gameFactoryContract = setGameHandlerAddressFunction(currProvider, gameFactoryContractAddress);
    updateGameHandler(gameFactoryContract);
    console.log(currProvider, gameFactoryContract);
  }, []);

  return (
    <GameContext.Provider value={{ provider, setGameProviderInstance, gameHandler, updateGameHandler, gameHandlerAddress, updateGameHandlerAddress }}>
      {children}
    </GameContext.Provider>
  );
}
