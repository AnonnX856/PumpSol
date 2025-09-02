import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import BN from 'bn.js';

export interface SimpleTokenParams {
  name: string;
  symbol: string;
  description?: string;
  decimals: number;
  initialSupply: number;
}

export class SimpleTokenCreator {
  private connection: Connection;
  private payer: PublicKey;

  constructor(connection: Connection, payer: PublicKey) {
    this.connection = connection;
    this.payer = payer;
  }

  async createToken(params: SimpleTokenParams): Promise<{
    mintKeypair: Keypair;
    mintAddress: PublicKey;
    tokenAccount: PublicKey;
    transaction: Transaction;
  }> {
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey;

    const tokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      this.payer
    );

    const rentExemption = await getMinimumBalanceForRentExemptMint(
      this.connection
    );
    const initialSupply = new BN(
      params.initialSupply * Math.pow(10, params.decimals)
    );

    const { blockhash } = await this.connection.getLatestBlockhash(
      'confirmed'
    );

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: this.payer,
    });

    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: this.payer,
        newAccountPubkey: mintAddress,
        space: MINT_SIZE,
        lamports: rentExemption,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    transaction.add(
      createInitializeMintInstruction(
        mintAddress,
        params.decimals,
        this.payer, // mint authority
        this.payer // freeze authority
      )
    );

    transaction.add(
      createAssociatedTokenAccountInstruction(
        this.payer,
        tokenAccount,
        this.payer,
        mintAddress
      )
    );

    transaction.add(
      createMintToInstruction(
        mintAddress,
        tokenAccount,
        this.payer,
        initialSupply
      )
    );

    return {
      mintKeypair,
      mintAddress,
      tokenAccount,
      transaction,
    };
  }

  async createAndSendToken(
    params: SimpleTokenParams,
    signTransaction: (transaction: Transaction) => Promise<Transaction>
  ): Promise<{
    mintAddress: PublicKey;
    tokenAccount: PublicKey;
    signature: string;
  }> {
    const { mintKeypair, mintAddress, tokenAccount, transaction } =
      await this.createToken(params);

    transaction.partialSign(mintKeypair);

    const signedTransaction = await signTransaction(transaction);

    const signature = await this.connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    await this.connection.confirmTransaction(signature, 'confirmed');

    return {
      mintAddress,
      tokenAccount,
      signature,
    };
  }
}