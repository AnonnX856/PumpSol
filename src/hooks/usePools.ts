const LAUNCHPAD_PROGRAM_ID = new PublicKey('LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj');import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { 
  Raydium, 
  getPdaLaunchpadPoolId, 
  LAUNCHPAD_PROGRAM,
  LaunchpadPoolInfo,
  PlatformConfig,
  Curve
} from '@raydium-io/raydium-sdk-v2';
import { NATIVE_MINT } from '@solana/spl-token';
import BN from 'bn.js';
import { useConfig } from './useConfig';

// Types for our hook
interface LaunchpadPool {
  poolId: string;
  tokenMint: string;
  quoteMint: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenPrice: number;
  totalTokensSold: number;
  totalSupply: number;
  fundingGoal: number;
  currentFunding: number;
  migrationProgress: number;
  migrationStatus: 'active' | 'migrated' | 'failed';
  rawPoolInfo?: LaunchpadPoolInfo;
}

interface UseLaunchpadPoolsReturn {
  pools: LaunchpadPool[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getPoolById: (poolId: string) => LaunchpadPool | undefined;
}

// Main hook
export const useLaunchpadPools = (): UseLaunchpadPoolsReturn => {
    const config = useConfig();
  const [pools, setPools] = useState<LaunchpadPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Initialize connection and Raydium SDK - use your mainnet RPC
      const connection = new Connection(config.rpcUrl, 'confirmed');
      const raydium = await Raydium.load({
        connection,
        cluster: 'mainnet'
      });

      
      
      const knownTokenMints = [
        'So11111111111111111111111111111111111111112', // SOL (for testing)
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC (for testing)
        
      ];

      const accounts = [];
      for (const mintA of knownTokenMints) {
        try {
          const poolId = getPdaLaunchpadPoolId(
            LAUNCHPAD_PROGRAM_ID, 
            new PublicKey(mintA), 
            NATIVE_MINT 
          ).publicKey;
          
          const accountInfo = await connection.getAccountInfo(poolId);
          if (accountInfo) {
            accounts.push({
              pubkey: poolId,
              account: accountInfo
            });
            console.log(`Found active pool: ${poolId.toString()}`);
          }
        } catch (e) {
          console.log(`No pool found for mint: ${mintA}`);
        }
      }

      // Demo pools for tests
      if (accounts.length === 0) {
        const demoPoolData: LaunchpadPool[] = [
          {
            poolId: 'demo_pool_001',
            tokenMint: 'DemoToken1111111111111111111111111111111',
            quoteMint: 'So11111111111111111111111111111111111111112',
            tokenSymbol: 'DEMO1',
            tokenName: 'Demo LaunchLab Token 1',
            tokenPrice: 0.000045,
            totalTokensSold: 2500000,
            totalSupply: 10000000,
            fundingGoal: 85,
            currentFunding: 38.25,
            migrationProgress: 45,
            migrationStatus: 'active',
          },
          {
            poolId: 'demo_pool_002', 
            tokenMint: 'DemoToken2222222222222222222222222222222',
            quoteMint: 'So11111111111111111111111111111111111111112',
            tokenSymbol: 'DEMO2',
            tokenName: 'Demo LaunchLab Token 2',
            tokenPrice: 0.000012,
            totalTokensSold: 7800000,
            totalSupply: 10000000,
            fundingGoal: 85,
            currentFunding: 93.6,
            migrationProgress: 92.5,
            migrationStatus: 'active',
          },
          {
            poolId: 'demo_pool_003',
            tokenMint: 'DemoToken3333333333333333333333333333333',
            quoteMint: 'So11111111111111111111111111111111111111112', 
            tokenSymbol: 'DEMO3',
            tokenName: 'Demo LaunchLab Token 3',
            tokenPrice: 0.000089,
            totalTokensSold: 10000000,
            totalSupply: 10000000,
            fundingGoal: 85,
            currentFunding: 85,
            migrationProgress: 100,
            migrationStatus: 'migrated',
          }
        ];
        
        setPools(demoPoolData);
        return;
      }

      console.log(`Found ${accounts.length} LaunchLab accounts`);

      const poolData: LaunchpadPool[] = [];
      const maxPools = 20;

      for (let i = 0; i < Math.min(accounts.length, maxPools); i++) {
        const account = accounts[i];
        
        try {
          console.log(`Processing pool ${i + 1}/${Math.min(accounts.length, maxPools)}: ${account.pubkey.toString()}`);
          
          const poolInfo = await raydium.launchpad.getRpcPoolInfo({ 
            poolId: account.pubkey 
          });

          console.log('Available pool properties:', Object.keys(poolInfo));
          console.log('Pool info sample:', {
            status: poolInfo.status,
            mintA: poolInfo.mintA?.toString(),
            mintB: poolInfo.mintB?.toString(),
            totalSellA: poolInfo.totalSellA?.toString(),
            totalQuoteFundRaising: poolInfo.totalQuoteFundRaising?.toString(),
          });

          let platformInfo: any = null;
          try {
            const platformData = await connection.getAccountInfo(poolInfo.platformId);
            if (platformData) {
              platformInfo = PlatformConfig.decode(platformData.data);
            }
          } catch (e) {
            console.warn('Could not fetch platform info for pool:', account.pubkey.toString());
          }

          const currentFundingBN = new BN(0); 
          const fundingGoalBN = poolInfo.totalQuoteFundRaising || new BN(85 * Math.pow(10, 9)); 
          
          const currentFunding = currentFundingBN.toNumber() / Math.pow(10, 9);
          const fundingGoal = fundingGoalBN.toNumber() / Math.pow(10, 9);
          const migrationProgress = (currentFunding / fundingGoal) * 100;

          let tokenPrice = 0;
          if (totalTokensSold > 0 && currentFunding > 0) {
            tokenPrice = currentFunding / totalTokensSold; 
          } else {
            tokenPrice = 0.00001; 
          }

          const totalSupplyBN = poolInfo.totalSellA || new BN(0);
          const totalSupply = totalSupplyBN.toNumber() / Math.pow(10, poolInfo.mintDecimalsA || 6);
          
          const estimatedSoldPercentage = Math.min(currentFunding / fundingGoal * 100, 100);
          const totalTokensSold = (totalSupply * estimatedSoldPercentage) / 100;

          let migrationStatus: 'active' | 'migrated' | 'failed' = 'active';
          if (migrationProgress >= 100) {
            migrationStatus = 'migrated';
          }

          const pool: LaunchpadPool = {
            poolId: account.pubkey.toString(),
            tokenMint: poolInfo.mintA.toString(),
            quoteMint: poolInfo.mintB.toString(),
            tokenSymbol: `TOKEN-${account.pubkey.toString().slice(0, 4)}`,
            tokenName: `LaunchLab Token ${account.pubkey.toString().slice(0, 8)}`,
            tokenPrice,
            totalTokensSold,
            totalSupply,
            fundingGoal,
            currentFunding,
            migrationProgress: Math.min(migrationProgress, 100),
            migrationStatus,
            rawPoolInfo: poolInfo,
          };

          poolData.push(pool);

        } catch (poolError) {
          console.warn(`Skipping account ${account.pubkey.toString()}:`, poolError);
          // This account may not bonding pool, continue to next
        }
      }

      setPools(poolData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const getPoolById = useCallback((poolId: string): LaunchpadPool | undefined => {
    return pools.find(pool => pool.poolId === poolId);
  }, [pools]);

  return {
    pools,
    loading,
    error,
    refetch: fetchPools,
    getPoolById,
  };
};

export const useLaunchpadPool = (poolId: string) => {
    const {rpcUrl} = useConfig()
  const [pool, setPool] = useState<LaunchpadPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPool = useCallback(async () => {
    if (!poolId) return;

    setLoading(true);
    setError(null);

    try {
      const connection = new Connection(rpcUrl, 'confirmed');
      const raydium = await Raydium.load({
        connection,
        cluster: 'mainnet'
      });

      const poolInfo = await raydium.launchpad.getRpcPoolInfo({ 
        poolId: new PublicKey(poolId)
      });

      // Get platform config
      let platformInfo: any = null;
      try {
        const platformData = await connection.getAccountInfo(poolInfo.platformId);
        if (platformData) {
          platformInfo = PlatformConfig.decode(platformData.data);
        }
      } catch (e) {
        console.warn('Could not fetch platform info');
      }

      // Calculate metrics using available properties
      const currentFundingBN = new BN(0); // We'll need to fetch this separately
      const fundingGoalBN = poolInfo.totalQuoteFundRaising || new BN(85 * Math.pow(10, 9));
      
      const currentFunding = currentFundingBN.toNumber() / Math.pow(10, 9);
      const fundingGoal = fundingGoalBN.toNumber() / Math.pow(10, 9);
      const migrationProgress = (currentFunding / fundingGoal) * 100;

      // Calculate token price using simple estimation
      let tokenPrice = 0;
      if (totalTokensSold > 0 && currentFunding > 0) {
        tokenPrice = currentFunding / totalTokensSold;
      } else {
        tokenPrice = 0.00001; // Default small price for new pools
      }

      const totalSupplyBN = poolInfo.totalSellA || new BN(0);
      const totalSupply = totalSupplyBN.toNumber() / Math.pow(10, poolInfo.mintDecimalsA || 6);
      
      // Estimate tokens sold (approximate)
      const estimatedSoldPercentage = Math.min(currentFunding / fundingGoal * 100, 100);
      const totalTokensSold = (totalSupply * estimatedSoldPercentage) / 100;

      const pool: LaunchpadPool = {
        poolId,
        tokenMint: poolInfo.mintA.toString(),
        quoteMint: poolInfo.mintB.toString(),
        tokenSymbol: `TOKEN-${poolId.slice(0, 4)}`,
        tokenName: `LaunchLab Token ${poolId.slice(0, 8)}`,
        tokenPrice,
        totalTokensSold,
        totalSupply,
        fundingGoal,
        currentFunding,
        migrationProgress: Math.min(migrationProgress, 100),
        migrationStatus: migrationProgress >= 100 ? 'migrated' : 'active',
        rawPoolInfo: poolInfo,
      };

      setPool(pool);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pool';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return {
    pool,
    loading,
    error,
    refetch: fetchPool,
  };
};

// Hook for calculating trade estimates
export const useBondingCurveCalculator = (poolId: string) => {
  const { pool } = useLaunchpadPool(poolId);

  const calculateTrade = useCallback((amount: number, isBuy: boolean) => {
    if (!pool?.rawPoolInfo) return null;

    try {
      if (isBuy) {
        // Simple estimate: use current average price
        const estimatedTokens = amount / (pool.tokenPrice || 0.0001);
        
        return {
          input: amount,
          output: estimatedTokens,
          inputToken: 'SOL',
          outputToken: pool.tokenSymbol || 'TOKEN',
          priceImpact: 0.1, 
        };
      } else {
        // Calculating SOL received for tokens sold
        const estimatedSOL = amount * (pool.tokenPrice || 0.0001);
        
        return {
          input: amount,
          output: estimatedSOL,
          inputToken: pool.tokenSymbol || 'TOKEN',
          outputToken: 'SOL',
          priceImpact: 0.1, 
        };
      }
    } catch (error) {
      console.error('Trade calculation error:', error);
      return null;
    }
  }, [pool]);

  return { calculateTrade };
};