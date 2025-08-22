import { useMemo } from 'react';

export const useConfig = () => {
  const config = useMemo(() => ({
    rpcUrl: process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',    
    programId: 'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj',
        
  }), []);

  return config;
};