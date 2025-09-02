// import { useMemo } from 'react';

// interface Config {
//   rpcUrl: string;
//   programId: string;
//   cluster: 'mainnet' | 'devnet';
// }

// export const useConfig = (): Config => {
//   const config = useMemo<Config>(() => ({
//     rpcUrl: process.env.REACT_APP_SOLANA_RPC_URL || 'https://dimensional-white-pine.solana-mainnet.quiknode.pro/e229761b955e887d87f412414b4024c993e7a91d/',    
//     programId: 'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj', // LaunchLab mainnet program
//     cluster: 'mainnet',
//   }), []);

//   return config;
// };

import { useMemo } from 'react';

interface Config {
  rpcUrl: string;
  programId: string;
  cluster: 'mainnet' | 'devnet';
}

export const useConfig = (): Config => {
  const config = useMemo<Config>(() => {
    const cluster = (process.env.REACT_APP_SOLANA_CLUSTER as 'mainnet' | 'devnet') || 'devnet';
    
    // Default RPC URLs based on cluster
    const defaultRpcUrl = cluster === 'mainnet' 
      ? 'https://dimensional-white-pine.solana-mainnet.quiknode.pro/e229761b955e887d87f412414b4024c993e7a91d/'
      : 'https://api.devnet.solana.com';
    
    return {
      rpcUrl: process.env.REACT_APP_SOLANA_RPC_URL || defaultRpcUrl,
      programId: 'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj',
      cluster,
    };
  }, []);

  return config;
};