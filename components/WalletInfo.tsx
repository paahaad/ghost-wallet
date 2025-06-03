'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPublicKey } from '@/lib/wallet';
import { requestAirdrop } from '@/lib/wallet';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, Wallet } from 'lucide-react';

const WalletInfo = () => {
  const { publicKey, balance, keypair, connection, refreshBalance } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);
  const { toast } = useToast();

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  const handleAirdrop = async () => {
    if (!keypair || !connection) return;
    
    setIsAirdropping(true);
    try {
      const result = await requestAirdrop(keypair.publicKey, connection);
      
      if (result) {
        toast({
          title: "Airdrop Success!",
          description: "1 SOL has been airdropped to your wallet",
        });
        await refreshBalance();
      } else {
        toast({
          title: "Airdrop Failed",
          description: "Unable to airdrop SOL. This only works on devnet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Airdrop error:", error);
      toast({
        title: "Airdrop Failed",
        description: "An error occurred during the airdrop request",
        variant: "destructive",
      });
    } finally {
      setIsAirdropping(false);
    }
  };

  if (!publicKey) {
    return <div className="text-center">No wallet loaded</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center">
            <Wallet className="mr-2" size={20} />
            Wallet Overview
          </span>
        </CardTitle>
        <CardDescription className="text-gray-100">
          Your Solana burner wallet on devnet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Public Address</h3>
            <div className="mt-1 flex items-center justify-between bg-muted p-3 rounded-md">
              <p className="text-sm font-mono break-all">
                {publicKey.length > 20 ? formatPublicKey(publicKey) : publicKey}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2"
                onClick={handleCopyAddress}
              >
                <Copy size={16} />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Balance</h3>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-2xl font-bold">{balance} SOL</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/send'}
        >
          Send SOL
        </Button>
        <Button
          onClick={handleAirdrop}
          disabled={isAirdropping}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
        >
          {isAirdropping ? 'Requesting...' : 'Airdrop 1 SOL'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletInfo;