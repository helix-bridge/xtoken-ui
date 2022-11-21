declare module '*.svg' {
  const content: Record<string, unknown>;
}

export declare global {
  interface Window {
    /* eslint-disable */
    less: any;
    web3: Web3;
    ethereum: any;
    tronWeb: any;
    tronLink: any;
    injectedWeb3: {
      [key: string]: Injected;
    };
    /* eslint-enable */
  }
}

declare module '@metamask/contract-metadata' {}
