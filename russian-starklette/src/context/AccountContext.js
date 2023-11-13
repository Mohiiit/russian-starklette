import React, { useContext, createContext, useState, useEffect } from 'react';
import { Account } from 'starknet';
import { getBalance } from '../utils';
import { useGame } from './ProviderContext';
// Create a context for the account information
const AccountContext = createContext();

// Create a custom hook to access the account context
export function useAccount() {
  return useContext(AccountContext);
}

// AccountProvider component to provide the account information
export function AccountProvider({ children }) {
    const {provider, gameHandler} = useGame();
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);

  // Function to set the account
  const setNewAccount = (address, privateKey) => {
    const account = new Account(provider, address, privateKey);
    localStorage.setItem('address', address);
    localStorage.setItem('key', privateKey);
    setAccount(account);
    console.log(account);
  };

  useEffect(() => {
    if(account && provider && gameHandler) {
      async function getBalances() {
        const current_Contract = await gameHandler;
        await getBalance(provider, current_Contract.address, account, setBalance);
      }
    }
  }, [account]);

  return (
    <AccountContext.Provider value={{ account, setNewAccount, balance, setBalance }}>
      {children}
    </AccountContext.Provider>
  );
}
