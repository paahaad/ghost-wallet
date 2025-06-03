'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { 
  createWallet, 
  getStoredWallet, 
  clearWallet, 
  getKeypairFromWallet,
  getBalance,
  getConnection,
  WalletData,
  TransactionData,
  DEFAULT_NETWORK
} from '@/lib/wallet';
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  walletData: WalletData | null;
  keypair: Keypair | null;
  publicKey: string | null;
  balance: number;
  transactions: TransactionData[];
  isLoading: boolean;
  connection: Connection | null;
  createNewWallet: () => void;
  resetWallet: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connection, setConnection] = useState<Connection | null>(null);
  const { toast } = useToast();

  // Initialize wallet on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Create connection
        const conn = getConnection();
        setConnection(conn);
        
        // Load existing wallet or create new one
        const storedWallet = getStoredWallet();
        
        if (storedWallet) {
          setWalletData(storedWallet);
          const kp = getKeypairFromWallet(storedWallet);
          setKeypair(kp);
          setPublicKey(kp.publicKey.toString());
          
          // Fetch balance
          const bal = await getBalance(kp.publicKey, conn);
          setBalance(bal);
        }
      } catch (error) {
        console.error('Failed to initialize wallet:', error);
        toast({
          title: "Error",
          description: "Failed to initialize wallet",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [toast]);

  // Create a new wallet
  const createNewWallet = () => {
    try {
      const newWalletData = createWallet();
      setWalletData(newWalletData);
      
      const kp = getKeypairFromWallet(newWalletData);
      setKeypair(kp);
      setPublicKey(kp.publicKey.toString());
      setBalance(0);
      
      toast({
        title: "Wallet Created",
        description: "Your new burner wallet has been created!",
      });
      
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive",
      });
    }
  };

  // Reset/clear wallet
  const resetWallet = () => {
    clearWallet();
    setWalletData(null);
    setKeypair(null);
    setPublicKey(null);
    setBalance(0);
    
    toast({
      title: "Wallet Reset",
      description: "Your wallet has been reset",
    });
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (keypair && connection) {
      try {
        const bal = await getBalance(keypair.publicKey, connection);
        setBalance(bal);
        return;
      } catch (error) {
        console.error('Failed to refresh balance:', error);
        toast({
          title: "Error",
          description: "Failed to refresh balance",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletData,
        keypair,
        publicKey,
        balance,
        transactions: walletData?.transactions || [],
        isLoading,
        connection,
        createNewWallet,
        resetWallet,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};