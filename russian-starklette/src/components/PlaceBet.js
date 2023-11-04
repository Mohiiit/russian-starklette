import React, { useState } from 'react';
import { Button, TextField, Grid, Container } from '@mui/material';
import { cairo, CallData } from 'starknet';

const BetForm = ({ currentGameContract, provider, account1 }) => {
  const [amount, setAmount] = useState();
  const [number, setNumber] = useState();

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  const placeBet = async(amount, number) => {
    console.log('inside place bet', amount, number);
    currentGameContract.connect(account1);
    console.log(currentGameContract, account1);
    const myCall = currentGameContract.populate("place_bet", [
        '0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973',
        number, amount
      ]);
      const res = await currentGameContract.place_bet(...myCall.calldata);
    //   const res = await currentGameContract.invoke("place_bet", ['0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973', '1', '20'])
      const res2 = await provider.waitForTransaction(res.transaction_hash);
      console.log(res, res2);
    // const multiCall = await account1.execute(
    //     [
    //     // Calling the first contract
    //     {
    //     contractAddress: currentGameContract,
    //     entrypoint: "place_bet",
    //     // approve 1 wei for bridge
    //     calldata: CallData.compile({
    //         caller_address: '0x517ececd29116499f4a1b64b094da79ba08dfd54a3edaa316134c41f8160973',
    //         bet_amount: 1,
    //         bet_number: 1
    //       })
    //     }
    //   ]
    // )
    // await provider.waitForTransaction(multiCall.transaction_hash);
  }

  const handlePlaceBet = async() => {
    if (amount && number) {
        await placeBet(amount, number);
        setAmount();
        setNumber();
    }
  };

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Amount"
            variant="outlined"
            value={amount}
            onChange={(event) => {
                setAmount(event.target.value);
              }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Number"
            variant="outlined"
            value={number}
            onChange={(event) => {
                setNumber(event.target.value);
              }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handlePlaceBet}>
            Place Bet
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BetForm;
