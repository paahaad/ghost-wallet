'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { sendSol, isValidSolanaAddress } from '@/lib/wallet';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ArrowLeft, SendHorizontal } from 'lucide-react';

const formSchema = z.object({
  recipient: z.string()
    .min(1, 'Recipient address is required')
    .refine(isValidSolanaAddress, {
      message: 'Invalid Solana address',
    }),
  amount: z.coerce.number()
    .positive('Amount must be greater than 0')
    .refine(val => val > 0, {
      message: 'Amount must be greater than 0',
    }),
});

const SendForm = () => {
  const { keypair, balance, connection, refreshBalance } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      amount: 0.1,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!keypair || !connection) {
      toast({
        title: "Error",
        description: "Wallet not initialized",
        variant: "destructive",
      });
      return;
    }

    // Validate balance
    if (values.amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${balance} SOL available`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const signature = await sendSol(
        keypair,
        values.recipient,
        values.amount,
        connection
      );

      if (signature) {
        toast({
          title: "Transaction Successful",
          description: `Sent ${values.amount} SOL successfully`,
        });
        await refreshBalance();
        router.push('/wallet');
      } else {
        toast({
          title: "Transaction Failed",
          description: "Failed to send SOL",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending SOL:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to send SOL: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send SOL</CardTitle>
        <CardDescription>Transfer SOL to another wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Solana address" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a valid Solana wallet address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (SOL)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.000001" 
                      min="0.000001" 
                      max={balance.toString()} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Available balance: {balance} SOL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/wallet')}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Send SOL'}
                {!isSubmitting && <SendHorizontal size={16} className="ml-2" />}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendForm;