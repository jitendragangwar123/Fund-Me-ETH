import React, { useState } from 'react';
import { ethers } from 'ethers';
import {CONTRACT_ADDRESS, CONTRACT_ABI} from "./constants/index"


const FundMe = () => {
  const [ethAmount, setEthAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const listenForTransactionMine = (transactionResponse: ethers.providers.TransactionResponse, provider: ethers.providers.Web3Provider) => {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise<void>((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt: ethers.providers.TransactionReceipt) => {
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations.`);
        resolve();
      });
    });
  };

  const fund = async () => {
    setMessage("Waiting for transaction confirmation...");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      setMessage("Transaction completed!");
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while processing the transaction.");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEthAmount(event.target.value);
  };

  return (
    <div>
      <h1>Fund Me DApp</h1>
      <input 
        type="text" 
        value={ethAmount} 
        onChange={handleChange} 
        placeholder="Enter amount in ETH" 
      />
      <button onClick={fund}>Fund</button>
      <p>{message}</p>
    </div>
  );
};

export default FundMe;