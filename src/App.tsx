import React, { useState, useEffect } from 'react';

import { ethers } from 'ethers';

import abi from './utils/Wall.json';

interface Post {
  user: string;
  timestamp: number;
  message: string;
}

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allPosts, setAllPosts] = useState([]);

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

        getAllPosts();
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

      getAllPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const getAllPosts = async () => {
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

        const posts = await wallContract.getAllPosts();

        const postsCleaned = posts.map((post: Post) => ({
          address: post.user,
          timestamp: new Date(post.timestamp * 1000),
          message: post.message,
        }));

        setAllPosts(postsCleaned);
      } else {
        console.error("Ethereum object doesn't exist!");
      }
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

        const wallTxn = await wallContract.post('A message');

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
    <>
      <div>
        {currentAccount && <button onClick={post}>Create a post</button>}
        {!currentAccount && <button onClick={connectWallet}>Connect Wallet</button>}
      </div>
      {currentAccount && (
        <div>
          <h2>Posts</h2>
          {allPosts.map((post: Post, index: number) => (
            <div
              key={index}
              style={{ backgroundColor: 'OldLace', marginTop: '16px', padding: '8px' }}
            >
              <div>Address: {post.user}</div>
              <div>Time: {post.timestamp.toString()}</div>
              <div>Message: {post.message}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default App;
