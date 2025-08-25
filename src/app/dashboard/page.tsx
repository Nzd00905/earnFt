'use client';

import { useEffect, useState } from 'react';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { AdWatcher } from '@/components/dashboard/ad-watcher';
import { getSiteConfig, getTransactions, onAuthChange } from '@/lib/actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SiteConfig, UserProfile, Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const fetchData = async () => {
    const [configData, allTxs] = await Promise.all([getSiteConfig(), getTransactions()]);
    setConfig(configData);
    setTransactions(allTxs.slice(0, 5));
    setAllTransactions(allTxs);
  };

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
        setUser(authUser);
        if (authUser) {
            fetchData();
        }
    });
    
    return () => unsubscribe();
  }, []);

  const onAdWatched = () => {
    fetchData(); // Refetch data to update balance and transactions
     // also update user state
    const unsubscribe = onAuthChange((authUser) => setUser(authUser));
    return () => unsubscribe();
  };

  const monthlyWithdrawals = allTransactions.reduce((acc, tx) => {
    const txDate = new Date(tx.timestamp);
    const currentDate = new Date();
    if (
      tx.type === 'withdrawal-payout' &&
      tx.status === 'completed' &&
      txDate.getMonth() === currentDate.getMonth() &&
      txDate.getFullYear() === currentDate.getFullYear()
    ) {
      return acc + tx.amount;
    }
    return acc;
  }, 0);


  if (!user || !config) {
    return null; // The layout handles the main loading state
  }

  return (
    <div className="flex flex-col sm:gap-4 sm:py-4">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <BalanceCard balance={user?.balance ?? 0} config={config} />
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardDescription>This Month&apos;s Withdrawals</CardDescription>
                <CardTitle className="text-4xl">${monthlyWithdrawals.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Total amount withdrawn this month
                </div>
              </CardContent>
            </Card>
          </div>
          <AdWatcher config={config} onAdWatched={onAdWatched} />
          <Card className="glass-card">
            <CardHeader className="px-7">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                A quick look at your latest activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <TableRow key={tx.id} className="bg-transparent hover:bg-muted/20">
                        <TableCell>
                          <div className="font-medium">{tx.type === 'earning' ? 'Token Claimed' : 'Withdrawal'}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {tx.description}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell capitalize">{tx.type}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className="capitalize" variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell className={`text-right ${tx.type === 'earning' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'earning' ? '+' : '-'}${tx.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No transactions yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {allTransactions.length > 5 && (
                <div className="mt-4 text-center">
                    <Link href="/dashboard/history" className="text-sm font-medium text-primary hover:underline">
                        View All Transactions
                    </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
