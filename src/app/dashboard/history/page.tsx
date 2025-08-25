'use client';
import { useEffect, useState } from 'react';
import { getTransactions } from '@/lib/actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import type { Transaction } from '@/lib/types';

function getStatusVariant(status: Transaction['status']) {
    switch (status) {
        case 'completed':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
}

function getTypeIcon(type: Transaction['type']) {
    switch (type) {
        case 'earning':
            return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
        case 'withdrawal-payout':
            return <ArrowUpRight className="h-4 w-4 text-red-400" />;
        default:
            return <ArrowUpRight className="h-4 w-4 text-yellow-400" />;
    }
}


export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
        setIsLoading(true);
        const txs = await getTransactions();
        setTransactions(txs);
        setIsLoading(false);
    }
    fetchTransactions();
  }, []);

  return (
    <div className="container py-8">
      <Card className="glass-card">
        <CardHeader>
            <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle className="font-headline text-2xl">Transaction History</CardTitle>
                    <CardDescription>A record of your earnings and withdrawals.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading transaction history...</p>
          ) : (
          <div className="rounded-md border border-primary/10">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/10">
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px] text-right">Amount</TableHead>
                  <TableHead className="w-[120px] text-center">Status</TableHead>
                  <TableHead className="w-[180px] text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-primary/10 bg-transparent hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-2">
                           {getTypeIcon(tx.type)}
                           <span className="capitalize font-medium">{tx.type === 'earning' ? 'Earning' : 'Withdrawal'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'earning' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'earning' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(tx.status)} className="capitalize">
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</TableCell>
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
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
