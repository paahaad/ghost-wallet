'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import WalletInfo from '@/components/WalletInfo';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';

export default function WalletPage() {
  const { publicKey, isLoading, resetWallet } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !publicKey) {
      router.push('/');
    }
  }, [isLoading, publicKey, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-4 text-muted-foreground">Loading wallet...</p>
      </div>
    );
  }

  if (!publicKey) {
    return null; // Will redirect in the effect
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/')}
            className="flex items-center"
          >
            <Home size={16} className="mr-1" />
            Home
          </Button>
          
          <h1 className="text-2xl font-bold">Burner Wallet</h1>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetWallet();
              router.push('/');
            }}
            className="text-destructive hover:text-destructive/90"
          >
            Reset
          </Button>
        </div>

        <WalletInfo />
        <TransactionList />
        
        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
        </div>
      </div>
    </main>
  );
}