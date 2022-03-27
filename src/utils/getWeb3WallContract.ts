import { ethers } from 'ethers';

import web3Wall from 'configs/Web3Wall.json';

export const getWeb3WallContract = (ethereum: any) => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  return new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, web3Wall.abi, signer);
};
