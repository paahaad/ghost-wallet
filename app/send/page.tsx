'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import SendForm from '@/components/SendForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RefreshCw } from 'lucide-react';

export default function SendPage() {
  const { publicKey, isLoading } = useWallet();
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
    <main className="min-h-screen py-12 px-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Send SOL</h1>
        <SendForm />
      </div>
    </main>
  );
}