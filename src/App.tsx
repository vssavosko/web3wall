import React, { useState, useCallback, useEffect, ChangeEvent } from 'react';

import { Contract } from 'ethers';

import { Post } from 'interfaces';

import { getWeb3WallContract } from 'utils/getWeb3WallContract';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState('');

  const getAllPosts = useCallback(async () => {
    try {
      if (window.ethereum) {
        const web3WallContract = getWeb3WallContract(window.ethereum);

        const posts = await web3WallContract.getAllPosts();

        const postsCleaned = posts.map(({ fromUser, timestamp, message }: Post) => ({
          fromUser,
          timestamp: new Date((timestamp as unknown as number) * 1000),
          message,
        }));

        setAllPosts(postsCleaned.reverse());
      } else {
        console.error("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error('Make sure you have metamask!');

        return;
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

  const createPost = async () => {
    try {
      if (window.ethereum) {
        const web3WallContract = getWeb3WallContract(window.ethereum);

        let count = await web3WallContract.getTotalPosts();

        console.log('Retrieved total post count...', count.toNumber());

        const createPostTxn = await web3WallContract.createPost(message, { gasLimit: 300000 });

        setMessage('');

        console.log('Mining...', createPostTxn.hash);

        await createPostTxn.wait();

        console.log('Mined -- ', createPostTxn.hash);

        count = await web3WallContract.getTotalPosts();

        console.log('Retrieved total post count...', count.toNumber());
      } else {
        console.error("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onNewPost = (fromUser: string, timestamp: number, message: string) => {
    setAllPosts((prevState) => [
      {
        fromUser,
        timestamp: new Date(timestamp * 1000),
        message,
      },
      ...prevState,
    ]);
  };

  const onChangeTextArea = ({ target }: ChangeEvent<{ value: string }>) => {
    setMessage(target.value);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    let web3WallContract: Contract;

    if (window.ethereum) {
      web3WallContract = getWeb3WallContract(window.ethereum);

      web3WallContract.on('NewPost', onNewPost);
    }

    return () => {
      if (web3WallContract) web3WallContract.off('NewPost', onNewPost);
    };
  }, []);

  useEffect(() => {
    if (currentAccount) getAllPosts();
  }, [currentAccount, getAllPosts]);

  return (
    <>
      <div>
        {currentAccount && (
          <div>
            <textarea value={message} onChange={onChangeTextArea}></textarea>
            <button onClick={createPost}>Create a post</button>
          </div>
        )}
        {!currentAccount && <button onClick={connectWallet}>Connect Wallet</button>}
      </div>
      {!allPosts.length && <p>No posts here yet</p>}
      {currentAccount && !!allPosts.length && (
        <div>
          <h2>Posts</h2>
          {allPosts.map((post: Post, index: number) => (
            <div
              key={index}
              style={{ backgroundColor: 'OldLace', marginTop: '16px', padding: '8px' }}
            >
              <div>Address: {post.fromUser}</div>
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
