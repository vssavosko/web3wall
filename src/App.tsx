import React, { useState, useEffect } from 'react';

import { ethers } from 'ethers';

import abi from './utils/Wall.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');

  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error('Make sure you have metamask!');
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length) {
        const account = accounts[0];

        console.log('Found an authorized account:', account);

        setCurrentAccount(account);
      } else {
        console.error('No authorized account found');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');

        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      console.log('Connected', accounts[0]);

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const post = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wallContract = new ethers.Contract(
          process.env.REACT_APP_CONTRACT_ADDRESS,
          contractABI,
          signer
        );

        let count = await wallContract.getTotalPosts();

        console.log('Retrieved total post count...', count.toNumber());

        const wallTxn = await wallContract.post();

        console.log('Mining...', wallTxn.hash);

        await wallTxn.wait();

        console.log('Mined -- ', wallTxn.hash);

        count = await wallContract.getTotalPosts();

        console.log('Retrieved total post count...', count.toNumber());
      } else {
        console.error("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div>
      <button onClick={post}>Create a post</button>
      {!currentAccount && <button onClick={connectWallet}>Connect Wallet</button>}
    </div>
  );
};

export default App;
