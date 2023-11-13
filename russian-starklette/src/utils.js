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
      number, amount
    ]);
    const res = await gameFactoryContract.place_bet(...myCall.calldata);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
  }

  export async function getBalance(provider, address, account, setBalance) {
    const gameFactoryContract = await createGameFactoryContract(provider, address);
    const response = await gameFactoryContract.get_player_balance(account.address);
    setBalance(response?.toString());
  }

  export async function updateNumber(provider, address, account, number) {
    const gameFactoryContract = await createGameFactoryContract(provider, address);
    gameFactoryContract.connect(account);
    const res = await gameFactoryContract.update_bet_number(number);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
  }

  export async function updateAmount(provider, address, account, amount) {
    const gameFactoryContract = await createGameFactoryContract(provider, address);
    gameFactoryContract.connect(account);
    
    const res = await gameFactoryContract.update_bet_amount(amount);
    const res2 = await provider.waitForTransaction(res.transaction_hash);
    console.log(res, res2);
  }