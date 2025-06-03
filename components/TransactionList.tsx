'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { formatDistance } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Gift,
} from 'lucide-react';
import { formatPublicKey } from '@/lib/wallet';

const TransactionList = () => {
  const { transactions } = useWallet();

  if (transactions.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto mt-6">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-6 overflow-hidden">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Recent wallet activity</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {transactions.map((tx) => (
            <div
              key={tx.signature}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {tx.type === 'send' ? (
                    <div className="mr-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-500">
                      <ArrowUpRight size={18} />
                    </div>
                  ) : tx.type === 'receive' ? (
                    <div className="mr-3 p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-500">
                      <ArrowDownLeft size={18} />
                    </div>
                  ) : (
                    <div className="mr-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-500">
                      <Gift size={18} />
                    </div>
                  )}

                  <div>
                    <p className="font-medium">
                      {tx.type === 'send'
                        ? 'Sent SOL'
                        : tx.type === 'receive'
                        ? 'Received SOL'
                        : 'Airdrop'}
                    </p>
                    {tx.otherParty && (
                      <p className="text-sm text-muted-foreground font-mono">
                        {formatPublicKey(tx.otherParty)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistance(new Date(tx.timestamp), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-medium ${tx.type === 'send' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount} SOL
                  </p>
                  <a
                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 inline-flex items-center mt-1"
                  >
                    View <ExternalLink size={12} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;