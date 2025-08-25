'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestWithdrawal } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

interface WithdrawDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  config: SiteConfig;
  currentBalance: number;
}

const formSchema = z.object({
  txId: z.string().min(10, { message: 'Transaction ID seems too short.' }),
});

type WithdrawFormValues = z.infer<typeof formSchema>;

export function WithdrawDialog({ isOpen, setIsOpen, config, currentBalance }: WithdrawDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { txId: '' },
  });

  const onSubmit = async (values: WithdrawFormValues) => {
    setIsLoading(true);
    try {
      await requestWithdrawal(values.txId);
      toast({
        title: 'Request Submitted',
        description: 'Your withdrawal request has been sent to the admin for manual processing.',
      });
      setIsOpen(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasEnoughBalance = currentBalance > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Withdrawal Request</DialogTitle>
          <DialogDescription>
            Follow the steps below to withdraw your earnings. Withdrawals are processed manually.
          </DialogDescription>
        </DialogHeader>

        {hasEnoughBalance ? (
        <>
            <Alert variant="default" className="bg-primary/5 border-primary/20">
            <AlertTitle className="font-semibold text-primary">Step 1: Pay Withdrawal Fee</AlertTitle>
            <AlertDescription className="text-primary/80">
                <p className="mt-2">
                To process your withdrawal, a fee of{' '}
                <strong className="font-bold">{config.withdrawalFee} {config.feeTokenName}</strong> is required.
                </p>
                <p className="mt-2">Please send the exact amount to the following address:</p>
                <code className="mt-2 block break-all rounded bg-muted px-2 py-1 text-sm font-mono">{config.feeDepositAddress}</code>
            </AlertDescription>
            </Alert>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <p className="text-sm font-semibold">Step 2: Submit Proof</p>
                <FormField
                control={form.control}
                name="txId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fee Transaction ID</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter the transaction ID from your wallet" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="mr-2 h-4 w-4" />
                    Request Withdrawal
                </Button>
                </DialogFooter>
            </form>
            </Form>
        </>
        ) : (
            <Alert variant="destructive">
                <AlertTitle>Insufficient Balance</AlertTitle>
                <AlertDescription>
                    You do not have any funds to withdraw. Watch some ads to increase your balance.
                </AlertDescription>
            </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
