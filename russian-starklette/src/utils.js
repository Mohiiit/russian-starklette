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


  export async function placeBet(provider, address, account, number, amount) {
    const gameFactoryContract = await createGameFactoryContract(provider, address);
    gameFactoryContract.connect(account);
    const myCall = gameFactoryContract.populate("place_bet", [
      account.address,
      number, amount
    ]);
    const res = await gameFactoryContract.place_bet(...myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
  }