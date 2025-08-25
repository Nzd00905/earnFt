'use client';
import { getSiteConfig } from '@/lib/actions';
import { SiteConfig } from '@/lib/types';
import { Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Logo({ className }: { className?: string }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
        const siteConfig = await getSiteConfig();
        setConfig(siteConfig);
    }
    fetchConfig();
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="rounded-lg bg-primary p-2">
        <Wallet className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="font-headline text-2xl font-bold text-foreground">
        {config?.websiteName ?? '...'}
      </span>
    </div>
  );
}
