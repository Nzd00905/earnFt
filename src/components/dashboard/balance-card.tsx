'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Loader2, Landmark } from 'lucide-react';
import { WithdrawDialog } from './withdraw-dialog';
import type { SiteConfig } from '@/lib/types';

interface BalanceCardProps {
  balance: number;
  config: SiteConfig | null;
}

export function BalanceCard({ balance, config }: BalanceCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <>
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-headline">
            ${balance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total accumulated earnings
          </p>
          <Button 
            className="mt-4 w-full sm:w-auto font-bold" 
            onClick={() => setIsDialogOpen(true)}
            disabled={!config}
            size="sm"
          >
            {config ? (
                <>
                    <Landmark className="mr-2 h-4 w-4" />
                    Withdraw
                </>
            ) : (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                </>
            )}
          </Button>
        </CardContent>
      </Card>
      {config && <WithdrawDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} config={config} currentBalance={balance} />}
    </>
  );
}
