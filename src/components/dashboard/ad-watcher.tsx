'use client';
import { useState, useEffect } from 'react';
import { watchAd, getAds } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Forward, Gift, Timer } from 'lucide-react';
import type { SiteConfig, Ad } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

export function AdWatcher({ config, onAdWatched }: { config: SiteConfig | null, onAdWatched: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isCooldown, setIsCooldown] = useState(false);
  const [countdown, setCountdown] = useState(config?.claimCooldownSeconds ?? 30);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAds = async () => {
        const fetchedAds = await getAds();
        setAds(fetchedAds);
    }
    fetchAds();
    if (config?.claimCooldownSeconds) {
        setCountdown(config.claimCooldownSeconds);
    }
  }, [config]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCooldown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown <= 0) {
      setIsCooldown(false);
      setCountdown(config?.claimCooldownSeconds ?? 30);
    }
    return () => clearInterval(timer);
  }, [isCooldown, countdown, config]);

  const handleWatchAd = async () => {
    if (ads.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Tokens Available',
        description: 'There are no tokens to claim right now. Please check back later.',
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 10;
        })
    }, 200);

    setTimeout(async () => {
        try {
            const newBalance = await watchAd();
            onAdWatched();
            toast({
                title: 'Success!',
                description: `You've earned $${config?.adCreditAmount.toFixed(2)}. Your new balance is $${newBalance.toFixed(2)}.`,
            });
            setIsCooldown(true);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Uh oh!',
                description: error.message || 'Could not process your claim. Please try again.',
            });
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    }, 2000);

  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Claim Tokens</CardTitle>
        <CardDescription>Claim tokens to add credits to your balance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-secondary/40 p-12 text-center">
            {isLoading ? (
                <div className="w-full text-center">
                    <Progress value={progress} className="mb-2" />
                    <p className="text-sm text-muted-foreground">Claiming token...</p>
                </div>
            ) : (
              <>
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    {isCooldown ? <Timer className="h-12 w-12 text-primary" /> : <Gift className="h-12 w-12 text-primary" />}
                </div>
                <p className="text-muted-foreground mb-4 mt-1">
                    You earn <strong>${config?.adCreditAmount.toFixed(2) ?? '...'}</strong> for every token you claim.
                </p>
                <Button onClick={handleWatchAd} disabled={!config || ads.length === 0 || isCooldown} size="lg" className="font-bold">
                    {isCooldown ? (
                        <>
                            <Timer className="mr-2 h-4 w-4" />
                            Claim again in {countdown}s
                        </>
                    ) : (
                        <>
                            <Forward className="mr-2 h-4 w-4" />
                            {ads.length === 0 ? 'No Tokens Available' : 'Claim Token'}
                        </>
                    )}
                </Button>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
