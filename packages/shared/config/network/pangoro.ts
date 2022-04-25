import { PolkadotChainConfig } from '../../model';

export const pangoroConfig: PolkadotChainConfig = {
  endpoints: {
    mmr: '',
  },
  isTest: true,
  logos: [
    { name: 'pangoro.png', type: 'main', mode: 'native' },
    { name: 'pangoro.png', type: 'minor', mode: 'native' },
  ],
  name: 'pangoro',
  provider: {
    etherscan: '',
    rpc: 'wss://pangoro-rpc.darwinia.network',
  },
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangoro-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  ss58Prefix: 18,
  specVersion: 28060,
  tokens: [{ name: 'PRING', precision: 9, bridges: ['helix'], type: 'native', logo: 'ring.svg' }],
  type: ['polkadot', 'darwinia'],
};