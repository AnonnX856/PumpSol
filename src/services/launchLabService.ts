// Working Token Service - src/services/tokenService.ts
// This replaces your problematic launchLabService.ts

import { Connection, PublicKey, Transaction, Keypair, SystemProgram } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import BN from 'bn.js';
import Decimal from 'decimal.js';
import { LaunchData, BondingCurveData, TokenInfo } from '../types';

export interface CreateTokenParams {
  name: string;
  symbol: string;
  description?: string;
  totalSupply: number;
  decimals: number;
  logoFile?: File;
}

export interface TradeParams {
  mint: PublicKey;
  amount: number;
  isBuy: boolean;
  slippage: number;
}

// Bonding Curve Data Interface
interface TokenBondingCurveData {
  mintAddress: PublicKey;
  tokenName: string;
  tokenSymbol: string;
  tokenImage?: string;
  description?: string;
  tokensSold: BN;
  totalSupply: BN;
  solCollected: BN;
  currentPrice: Decimal;
  progress: number;
  isComplete: boolean;
  createdAt: number;
}

// Storage for bonding curve data
class BondingCurveStorage {
  private static curves = new Map<string, TokenBondingCurveData>();
  
  static saveCurve(mintAddress: string, data: TokenBondingCurveData) {
    this.curves.set(mintAddress, data);
    // Save to localStorage for persistence with error handling
    if (typeof window !== 'undefined') {
      try {
        const storageData = {
          ...data,
          mintAddress: data.mintAddress.toString(),
          tokensSold: data.tokensSold.toString(),
          totalSupply: data.totalSupply.toString(),
          solCollected: data.solCollected.toString(),
          currentPrice: data.currentPrice.toString(),
        };
        localStorage.setItem(`bonding_curve_${mintAddress}`, JSON.stringify(storageData));
        console.log('💾 Saved bonding curve to localStorage:', mintAddress);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  }
  
  static getCurve(mintAddress: string): TokenBondingCurveData | null {
    // Try memory first
    let curve = this.curves.get(mintAddress);
    if (curve) return curve;
    
    // Try localStorage with error handling
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`bonding_curve_${mintAddress}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          curve = {
            ...parsed,
            mintAddress: new PublicKey(parsed.mintAddress),
            tokensSold: new BN(parsed.tokensSold.toString()),
            totalSupply: new BN(parsed.totalSupply.toString()),
            solCollected: new BN(parsed.solCollected.toString()),
            currentPrice: new Decimal(parsed.currentPrice.toString()),
          };
          this.curves.set(mintAddress, curve);
          return curve;
        }
      } catch (error) {
        console.error(`Failed to parse stored curve for ${mintAddress}:`, error);
        // Remove corrupted data
        try {
          localStorage.removeItem(`bonding_curve_${mintAddress}`);
        } catch (e) {
          console.error('Failed to remove corrupted data:', e);
        }
      }
    }
    
    return null;
  }
  
  static getAllCurves(): TokenBondingCurveData[] {
    const curves: TokenBondingCurveData[] = [];
    
    // Get from memory first
    for (const curve of this.curves.values()) {
      curves.push(curve);
    }
    
    // Get from localStorage with error handling
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('bonding_curve_')) {
            const mintAddress = key.replace('bonding_curve_', '');
            if (!this.curves.has(mintAddress)) {
              const curve = this.getCurve(mintAddress);
              if (curve) curves.push(curve);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load curves from localStorage:', error);
      }
    }
    
    return curves.sort((a, b) => b.createdAt - a.createdAt);
  }
  
  // Add method to clear corrupted data
  static clearCorruptedData() {
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('bonding_curve_')) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                JSON.parse(stored); // Test if it's valid JSON
              }
            } catch (e) {
              keysToRemove.push(key);
            }
          }
        }
        
        // Remove corrupted entries
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log('🗑️ Removed corrupted data:', key);
        });
        
        if (keysToRemove.length > 0) {
          console.log(`✅ Cleared ${keysToRemove.length} corrupted entries`);
        }
      } catch (error) {
        console.error('Failed to clear corrupted data:', error);
      }
    }
  }
}

class WorkingTokenService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Create a simple SPL token (working implementation)
  async createToken(params: CreateTokenParams, wallet: WalletContextState): Promise<string> {
    console.log('Starting token creation process...');
    
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // Generate mint keypair
      const mintKeypair = Keypair.generate();
      console.log('Generated mint address:', mintKeypair.publicKey.toString());

      // Get associated token account
      const tokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      );

      // Get rent exemption amount
      const rentExemption = await getMinimumBalanceForRentExemptMint(this.connection);

      // Calculate initial supply with decimals
      const initialSupply = new BN(params.totalSupply * Math.pow(10, params.decimals));

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');

      // Create transaction
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: wallet.publicKey
      });

      // Create mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports: rentExemption,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Initialize mint
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          params.decimals,
          wallet.publicKey, // mint authority
          wallet.publicKey, // freeze authority
          TOKEN_PROGRAM_ID
        )
      );

      // Create associated token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          tokenAccount, // associated token account
          wallet.publicKey, // owner
          mintKeypair.publicKey, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      // Mint initial supply to token account
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          tokenAccount,
          wallet.publicKey, // mint authority
          initialSupply,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Sign with mint keypair first
      transaction.partialSign(mintKeypair);

      // Then sign with wallet
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send transaction
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3
        }
      );

      console.log('Transaction sent with signature:', signature);

      // Confirm transaction
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('Token created successfully!');

      // Create bonding curve data
      await this.createBondingCurve(
        mintKeypair.publicKey,
        params.name,
        params.symbol,
        params.logoFile,
        params.description
      );

      return mintKeypair.publicKey.toString();
    } catch (error) {
      console.error('Token creation failed:', error);
      throw new Error(`Token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create bonding curve for the token
  async createBondingCurve(
    mintAddress: PublicKey,
    tokenName: string,
    tokenSymbol: string,
    logoFile?: File,
    description?: string
  ): Promise<TokenBondingCurveData> {
    console.log('Creating bonding curve for token...');

    // Handle image upload if present
    let imageUrl = '';
    if (logoFile) {
      imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(logoFile);
      });
    }

    const totalSupply = new BN('800000000000000'); // 800M tokens for sale (with 6 decimals)
    const curve: TokenBondingCurveData = {
      mintAddress,
      tokenName,
      tokenSymbol,
      tokenImage: imageUrl || undefined,
      description,
      tokensSold: new BN(0),
      totalSupply,
      solCollected: new BN(0),
      currentPrice: new Decimal('0.000001'), // Starting price: 0.000001 SOL per token
      progress: 0,
      isComplete: false,
      createdAt: Date.now()
    };
    
    BondingCurveStorage.saveCurve(mintAddress.toString(), curve);
    console.log('Bonding curve created successfully!');
    return curve;
  }

  // Get bonding curve data
  getBondingCurveData(mintAddress: PublicKey): TokenBondingCurveData | null {
    return BondingCurveStorage.getCurve(mintAddress.toString());
  }

  // Calculate bonding curve price (exponential curve)
  private calculatePrice(tokensSold: BN, totalSupply: BN): Decimal {
    const progress = new Decimal(tokensSold.toString()).div(totalSupply.toString());
    const basePrice = new Decimal('0.000001');
    const maxPrice = new Decimal('0.0001');
    
    // Exponential curve: price = basePrice * (1 + progress)^3
    const multiplier = new Decimal(1).plus(progress).pow(3);
    return basePrice.mul(multiplier).min(maxPrice);
  }

  // Calculate how many tokens you get for a given SOL amount
  calculateBuyTokens(mintAddress: PublicKey, solAmount: BN): {
    tokens: BN;
    newPrice: Decimal;
    priceImpact: number;
  } {
    const curve = this.getBondingCurveData(mintAddress);
    if (!curve) throw new Error('Bonding curve not found');
    
    const solAmountDecimal = new Decimal(solAmount.toString()).div(1e9); // Convert to SOL
    const currentPrice = curve.currentPrice;
    
    // Simple calculation: tokens = solAmount / averagePrice
    const tokensRaw = solAmountDecimal.div(currentPrice);
    const tokens = new BN(tokensRaw.mul(1e6).toFixed(0)); // Convert to token units (6 decimals)
    
    // Calculate new price after this purchase
    const newTokensSold = curve.tokensSold.add(tokens);
    const newPrice = this.calculatePrice(newTokensSold, curve.totalSupply);
    
    // Calculate price impact
    const priceImpact = newPrice.sub(currentPrice).div(currentPrice).mul(100).toNumber();
    
    return {
      tokens,
      newPrice,
      priceImpact: Math.abs(priceImpact)
    };
  }

  // Calculate how much SOL you get for selling tokens
  calculateSellTokens(mintAddress: PublicKey, tokenAmount: BN): {
    sol: BN;
    newPrice: Decimal;
    priceImpact: number;
  } {
    const curve = this.getBondingCurveData(mintAddress);
    if (!curve) throw new Error('Bonding curve not found');
    
    const tokenAmountDecimal = new Decimal(tokenAmount.toString()).div(1e6); // Convert from token units
    const currentPrice = curve.currentPrice;
    
    // Simple calculation: sol = tokenAmount * currentPrice
    const solRaw = tokenAmountDecimal.mul(currentPrice);
    const sol = new BN(solRaw.mul(1e9).toFixed(0)); // Convert to lamports
    
    // Calculate new price after this sale
    const newTokensSold = BN.max(new BN(0), curve.tokensSold.sub(tokenAmount));
    const newPrice = this.calculatePrice(newTokensSold, curve.totalSupply);
    
    // Calculate price impact
    const priceImpact = currentPrice.sub(newPrice).div(currentPrice).mul(100).toNumber();
    
    return {
      sol,
      newPrice,
      priceImpact: Math.abs(priceImpact)
    };
  }

  // Update bonding curve after a trade (simulation)
  updateBondingCurve(
    mintAddress: PublicKey,
    tokensDelta: BN,
    solDelta: BN,
    isBuy: boolean
  ): TokenBondingCurveData {
    const curve = this.getBondingCurveData(mintAddress);
    if (!curve) throw new Error('Bonding curve not found');
    
    // Update tokens sold and SOL collected
    curve.tokensSold = isBuy 
      ? curve.tokensSold.add(tokensDelta)
      : BN.max(new BN(0), curve.tokensSold.sub(tokensDelta));
      
    curve.solCollected = isBuy
      ? curve.solCollected.add(solDelta)
      : BN.max(new BN(0), curve.solCollected.sub(solDelta));
    
    // Recalculate price and progress
    curve.currentPrice = this.calculatePrice(curve.tokensSold, curve.totalSupply);
    curve.progress = curve.tokensSold.mul(new BN(100)).div(curve.totalSupply).toNumber();
    curve.isComplete = curve.progress >= 100;
    
    // Save updated curve
    BondingCurveStorage.saveCurve(mintAddress.toString(), curve);
    
    return curve;
  }

  // Simulate buy transaction (for testing)
  async buyTokens(params: TradeParams, wallet: WalletContextState): Promise<string> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountBN = new BN(params.amount * 1e9); // SOL to lamports
      const { tokens, newPrice } = this.calculateBuyTokens(params.mint, amountBN);
      
      // Update bonding curve
      this.updateBondingCurve(params.mint, tokens, amountBN, true);
      
      console.log(`Simulated buy: ${params.amount} SOL for ${(tokens.toNumber() / 1e6).toLocaleString()} tokens`);
      console.log(`New price: ${newPrice.toFixed(8)} SOL per token`);
      
      // Return a mock transaction signature
      return 'mock_buy_signature_' + Date.now();
    } catch (error) {
      throw new Error(`Buy failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Simulate sell transaction (for testing)
  async sellTokens(params: TradeParams, wallet: WalletContextState): Promise<string> {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const tokenAmountBN = new BN(params.amount * 1e6); // Tokens with 6 decimals
      const { sol, newPrice } = this.calculateSellTokens(params.mint, tokenAmountBN);
      
      // Update bonding curve
      this.updateBondingCurve(params.mint, tokenAmountBN, sol, false);
      
      console.log(`Simulated sell: ${params.amount} tokens for ${(sol.toNumber() / 1e9).toFixed(6)} SOL`);
      console.log(`New price: ${newPrice.toFixed(8)} SOL per token`);
      
      // Return a mock transaction signature
      return 'mock_sell_signature_' + Date.now();
    } catch (error) {
      throw new Error(`Sell failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get launches (convert our bonding curve data to LaunchData format)
  async getLaunches(): Promise<LaunchData[]> {
    const curves = BondingCurveStorage.getAllCurves();
    
    return curves.map(curve => {
      const tokenInfo: TokenInfo = {
        mint: curve.mintAddress,
        symbol: curve.tokenSymbol,
        name: curve.tokenName,
        decimals: 6,
        logoURI: curve.tokenImage,
        totalSupply: curve.totalSupply,
      };

      const bondingCurve: BondingCurveData = {
        virtualTokenReserves: curve.totalSupply.sub(curve.tokensSold),
        virtualSolReserves: new BN(curve.currentPrice.mul(curve.totalSupply.toString()).mul(1e9).toFixed(0)),
        realTokenReserves: curve.totalSupply.sub(curve.tokensSold),
        realSolReserves: curve.solCollected,
        tokenTotalSupply: curve.totalSupply,
        complete: curve.isComplete,
      };

      const launch: LaunchData = {
        id: curve.mintAddress.toString(),
        token: tokenInfo,
        bondingCurve,
        creator: new PublicKey('11111111111111111111111111111112'), // Mock creator
        createdAt: new Date(curve.createdAt),
        marketCap: parseFloat((curve.totalSupply.toNumber() / 1e6 * curve.currentPrice.toNumber()).toFixed(2)),
        volume24h: parseFloat((curve.solCollected.toNumber() / 1e9 * 0.1).toFixed(2)), // Mock 24h volume
        priceChange24h: Math.random() * 20 - 10, // Mock price change
      };

      return launch;
    });
  }

  // Calculate current price from bonding curve
  getCurrentPrice(bondingCurve: BondingCurveData): number {
    const virtualSolReserves = bondingCurve.virtualSolReserves.toNumber() / 1e9;
    const virtualTokenReserves = bondingCurve.virtualTokenReserves.toNumber() / 1e6;
    
    return virtualSolReserves / virtualTokenReserves;
  }

  // Calculate buy price
  calculateBuyPrice(bondingCurve: BondingCurveData, amountSol: number): number {
    const virtualSolReserves = bondingCurve.virtualSolReserves.toNumber() / 1e9;
    const virtualTokenReserves = bondingCurve.virtualTokenReserves.toNumber() / 1e6;
    
    const k = virtualSolReserves * virtualTokenReserves;
    const newSolReserves = virtualSolReserves + amountSol;
    const newTokenReserves = k / newSolReserves;
    
    return virtualTokenReserves - newTokenReserves;
  }

  // Calculate sell price
  calculateSellPrice(bondingCurve: BondingCurveData, amountTokens: number): number {
    const virtualSolReserves = bondingCurve.virtualSolReserves.toNumber() / 1e9;
    const virtualTokenReserves = bondingCurve.virtualTokenReserves.toNumber() / 1e6;
    
    const k = virtualSolReserves * virtualTokenReserves;
    const newTokenReserves = virtualTokenReserves + amountTokens;
    const newSolReserves = k / newTokenReserves;
    
    return virtualSolReserves - newSolReserves;
  }

  // Get all bonding curves
  getAllBondingCurves(): TokenBondingCurveData[] {
    return BondingCurveStorage.getAllCurves();
  }
}

export default WorkingTokenService;