import { Keypair, PublicKey, Connection, LAMPORTS_PER_SOL, TransactionInstruction, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

// Constants
export const SOLANA_NETWORKS = {
  MAINNET: 'https://api.mainnet-beta.solana.com',
  TESTNET: 'https://api.testnet.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
};

export const DEFAULT_NETWORK = SOLANA_NETWORKS.DEVNET;

// Types
export interface TransactionData {
  signature: string;
  timestamp: number; // Unix timestamp
  amount: number; // in SOL
  type: 'send' | 'receive' | 'airdrop';
  otherParty?: string; // public key of the other party
}

export interface WalletData {
  keypair: string; // base58 encoded secret key
  transactions: TransactionData[];
  network: string;
}

// Key Storage Utilities
export const storeWallet = (walletData: WalletData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('solanaWallet', JSON.stringify(walletData));
  }
};

export const getStoredWallet = (): WalletData | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('solanaWallet');
    if (data) {
      return JSON.parse(data);
    }
  }
  return null;
};

export const clearWallet = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('solanaWallet');
  }
};

export const hasWallet = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('solanaWallet') !== null;
  }
  return false;
};

// Wallet Operations
export const createWallet = (): WalletData => {
  const keypair = Keypair.generate();
  const walletData: WalletData = {
    keypair: bs58.encode(keypair.secretKey),
    transactions: [],
    network: DEFAULT_NETWORK,
  };
  storeWallet(walletData);
  return walletData;
};

export const getKeypairFromWallet = (walletData: WalletData): Keypair => {
  const secretKey = bs58.decode(walletData.keypair);
  return Keypair.fromSecretKey(secretKey);
};

export const getConnection = (network = DEFAULT_NETWORK): Connection => {
  return new Connection(network, 'confirmed');
};

// Balance Operations
export const getBalance = async (
  publicKey: PublicKey, 
  connection: Connection
): Promise<number> => {
  try {
    const lamports = await connection.getBalance(publicKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

// Airdrop Operations (Devnet only)
export const requestAirdrop = async (
  publicKey: PublicKey, 
  connection: Connection, 
  amount: number = 1
): Promise<string | null> => {
  try {
    const signature = await connection.requestAirdrop(
      publicKey, 
      amount * LAMPORTS_PER_SOL
    );
    
    await connection.confirmTransaction(signature, 'confirmed');
    
    // Add to transaction history
    const walletData = getStoredWallet();
    if (walletData) {
      const transaction: TransactionData = {
        signature,
        timestamp: Date.now(),
        amount,
        type: 'airdrop'
      };
      walletData.transactions.unshift(transaction);
      storeWallet(walletData);
    }
    
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    return null;
  }
};

// Send SOL
export const sendSol = async (
  keypair: Keypair, 
  toPublicKey: string, 
  amount: number, 
  connection: Connection
): Promise<string | null> => {
  try {
    const destinationPubkey = new PublicKey(toPublicKey);
    const lamports = amount * LAMPORTS_PER_SOL;
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: destinationPubkey,
        lamports,
      })
    );
    
    const signature = await sendAndConfirmTransaction(
      connection, 
      transaction, 
      [keypair]
    );
    
    // Add to transaction history
    const walletData = getStoredWallet();
    if (walletData) {
      const transactionData: TransactionData = {
        signature,
        timestamp: Date.now(),
        amount: amount,
        type: 'send',
        otherParty: toPublicKey
      };
      walletData.transactions.unshift(transactionData);
      storeWallet(walletData);
    }
    
    return signature;
  } catch (error) {
    console.error('Error sending SOL:', error);
    return null;
  }
};

// Format public key for display (truncate)
export const formatPublicKey = (publicKey: string): string => {
  if (publicKey.length <= 12) return publicKey;
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`;
};

// Validate Solana public key
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};