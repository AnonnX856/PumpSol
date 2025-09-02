import {
  PublicKey,
  Connection,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import BN from 'bn.js';
import Decimal from 'decimal.js';

export interface MockBondingCurveData {
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

export interface MockTradeResult {
  transaction: Transaction;
  expectedTokens: BN;
  newPrice: Decimal;
  priceImpact: number;
}

class MockBondingCurveStorage {
  private static curves = new Map<string, MockBondingCurveData>();

  static saveCurve(mintAddress: string, data: MockBondingCurveData) {
    this.curves.set(mintAddress, data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `bonding_curve_${mintAddress}`,
        JSON.stringify({
          ...data,
          mintAddress: data.mintAddress.toString(),
        })
      );
    }
  }

  static getCurve(mintAddress: string): MockBondingCurveData | null {
    let curve = this.curves.get(mintAddress);
    if (curve) return curve;

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`bonding_curve_${mintAddress}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        curve = {
          ...parsed,
          mintAddress: new PublicKey(parsed.mintAddress),
          tokensSold: new BN(parsed.tokensSold),
          solCollected: new BN(parsed.solCollected),
          currentPrice: new Decimal(parsed.currentPrice),
        };
        this.curves.set(mintAddress, curve);
        return curve;
      }
    }

    return null;
  }

  static getAllCurves(): MockBondingCurveData[] {
    const curves: MockBondingCurveData[] = [];

    for (const curve of this.curves.values()) {
      curves.push(curve);
    }

    if (typeof window !== 'undefined') {
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
    }

    return curves.sort((a, b) => b.createdAt - a.createdAt);
  }
}

export class MockBondingCurve {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  static createBondingCurve(
    mintAddress: PublicKey,
    tokenName: string,
    tokenSymbol: string,
    tokenImage?: string,
    description?: string
  ): MockBondingCurveData {
    const totalSupply = new BN('800000000000000'); // 800M tokens for sale (with 6 decimals)
    const curve: MockBondingCurveData = {
      mintAddress,
      tokenName,
      tokenSymbol,
      tokenImage,
      description,
      tokensSold: new BN(0),
      totalSupply,
      solCollected: new BN(0),
      currentPrice: new Decimal('0.000001'),
      progress: 0,
      isComplete: false,
      createdAt: Date.now(),
    };

    MockBondingCurveStorage.saveCurve(mintAddress.toString(), curve);
    return curve;
  }

  getBondingCurveData(mintAddress: PublicKey): MockBondingCurveData | null {
    return MockBondingCurveStorage.getCurve(mintAddress.toString());
  }

  private calculatePrice(tokensSold: BN, totalSupply: BN): Decimal {
    const progress = new Decimal(tokensSold.toString()).div(
      totalSupply.toString()
    );
    const basePrice = new Decimal('0.000001');
    const maxPrice = new Decimal('0.0001');

    const multiplier = new Decimal(1).plus(progress).pow(3);
    return basePrice.mul(multiplier).min(maxPrice);
  }

  calculateBuyTokens(
    mintAddress: PublicKey,
    solAmount: BN
  ): {
    tokens: BN;
    newPrice: Decimal;
    priceImpact: number;
  } {
    const curve = this.getBondingCurveData(mintAddress);
    if (!curve) throw new Error('Bonding curve not found');

    const solAmountDecimal = new Decimal(solAmount.toString()).div(1e9);
    const currentPrice = curve.currentPrice;

    const tokensRaw = solAmountDecimal.div(currentPrice);
    const tokens = new BN(tokensRaw.mul(1e6).toFixed(0));

    const newTokensSold = curve.tokensSold.add(tokens);
    const newPrice = this.calculatePrice(newTokensSold, curve.totalSupply);

    const priceImpact = newPrice
      .sub(currentPrice)
      .div(currentPrice)
      .mul(100)
      .toNumber();

    return {
      tokens,
      newPrice,
      priceImpact: Math.abs(priceImpact),
    };
  }

  calculateSellTokens(
    mintAddress: PublicKey,
    tokenAmount: BN
  ): {
    sol: BN;
    newPrice: Decimal;
    priceImpact: number;
  } {
    const curve = this.getBondingCurveData(mintAddress);
    if (!curve) throw new Error('Bonding curve not found');

    const tokenAmountDecimal = new Decimal(tokenAmount.toString()).div(1e6);
    const currentPrice = curve.currentPrice;

    const solRaw = tokenAmountDecimal.mul(currentPrice);
    const sol = new BN(solRaw.mul(1e9).toFixed(0));

    const newTokensSold = BN.max(new BN(0), curve.tokensSold.sub(tokenAmount));
    const newPrice = this.calculatePrice(newTokensSold, curve.totalSupply);

    const priceImpact = currentPrice
      .sub(newPrice)
      .div(currentPrice)
      .mul(100)
      .toNumber();

    return {
      sol,
      newPrice,
      priceImpact: Math.abs(priceImpact),
    };
  }

  async createBuyTransaction(
    mintAddress: PublicKey,
    buyer: PublicKey,
    solAmount: BN
  ): Promise<MockTradeResult> {
    const curve = this.getBondingCurveData(mintAddress);
    if (!curve) throw new Error('Bonding curve not found');

    const { tokens, newPrice, priceImpact } = this.calculateBuyTokens(
      mintAddress,
      solAmount
    );

    const transaction = new Transaction();

    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = buyer;

    const curveVault = new PublicKey('11111111111111111111111111111112');

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: buyer,
        toPubkey: curveVault,
        lamports: solAmount.toNumber(),
      })
    );

    return {
      transaction,
      expectedTokens: tokens,
      newPrice,
      priceImpact,
    };
  }

  updateBondingCurve(
    mintAddress: PublicKey,
    tokensDelta: BN,
    solDelta: BN,
    isBuy: boolean
  ): MockBondingCurveData {
    const curve = this.getBondingCurveData(mintAddress);
    if (!curve) throw new Error('Bonding curve not found');

    curve.tokensSold = isBuy
      ? curve.tokensSold.add(tokensDelta)
      : BN.max(new BN(0), curve.tokensSold.sub(tokensDelta));

    curve.solCollected = isBuy
      ? curve.solCollected.add(solDelta)
      : BN.max(new BN(0), curve.solCollected.sub(solDelta));

    curve.currentPrice = this.calculatePrice(curve.tokensSold, curve.totalSupply);
    curve.progress = curve.tokensSold
      .mul(new BN(100))
      .div(curve.totalSupply)
      .toNumber();
    curve.isComplete = curve.progress >= 100;

    MockBondingCurveStorage.saveCurve(mintAddress.toString(), curve);

    return curve;
  }

  getAllBondingCurves(): MockBondingCurveData[] {
    return MockBondingCurveStorage.getAllCurves();
  }
}