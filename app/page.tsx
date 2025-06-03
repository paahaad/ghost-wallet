'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { hasWallet } from '@/lib/wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRight, Plus, RefreshCw, Wallet } from 'lucide-react';

export default function Home() {
  const { createNewWallet, resetWallet, isLoading } = useWallet();
  const [walletExists, setWalletExists] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setWalletExists(hasWallet());
  }, []);

  const handleCreateWallet = () => {
    createNewWallet();
    router.push('/wallet');
  };

  const handleGoToWallet = () => {
    router.push('/wallet');
  };

  const handleResetWallet = () => {
    resetWallet();
    setWalletExists(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-3">
            <Wallet size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Solana Burner Wallet
          </h1>
          <p className="text-muted-foreground max-w-sm mx-auto">
            A lightweight, ephemeral wallet for Solana. Perfect for temporary use - no sign-up required.
          </p>
        </div>
        
        <Card className="w-full border border-primary/20 shadow-md transition-all hover:shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              {walletExists 
                ? "You already have a burner wallet" 
                : "Create a new burner wallet in seconds"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : walletExists ? (
              <div className="flex flex-col w-full space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all"
                  onClick={handleGoToWallet}
                >
                  Go to Wallet
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResetWallet}
                >
                  Reset Wallet
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all"
                onClick={handleCreateWallet}
              >
                <Plus size={16} className="mr-2" />
                Create New Wallet
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-2 text-xs text-muted-foreground">
            Running on Solana Devnet
          </CardFooter>
        </Card>
        
        <p className="text-xs text-center mt-8 text-muted-foreground">
          All wallet data is stored locally in your browser.
          <br />No data is sent to any server.
        </p>
      </div>
    </main>
  );
}