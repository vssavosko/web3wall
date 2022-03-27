import { ethers } from 'ethers';

import wall from 'configs/Wall.json';

export const getWallContract = (ethereum: any) => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  return new ethers.Contract(process.env.REACT_APP_CONTRACT_ADDRESS, wall.abi, signer);
};
