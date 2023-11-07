import {
    Account,
    Provider,
    Contract,
    RpcProvider,
    shortString,
    cairo,
    stark,
  } from "starknet";

export async function createGameFactoryContract(provider, address) {
    // const currentContract = await gameHandler;
    // console.log(currentContract.address);
  
    const { abi: gameFactoryAbi } = await provider.getClassAt(address);
    if (gameFactoryAbi === undefined) {
      throw new Error("No ABI.");
    }
  
    const gameFactoryContract = new Contract(gameFactoryAbi, address, provider);
  
    return gameFactoryContract;
  }