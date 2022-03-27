/* eslint-disable @typescript-eslint/no-unused-vars */

/// <reference types="react-scripts" />

namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_CONTRACT_ADDRESS: string;
  }
}

interface Window {
  ethereum: any;
}
