
'use client';
import { useEffect, useState } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { getSiteConfig } from '@/lib/actions';
import type { SiteConfig } from '@/lib/types';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchConfig = async () => {
      const siteConfig = await getSiteConfig();
      setConfig(siteConfig);
    }
    fetchConfig();
  }, [])

  useEffect(() => {
    if (isMounted && config?.websiteName) {
      document.title = config.websiteName;
    }
  }, [config, isMounted]);


  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>{config?.websiteName ?? 'Loading...'}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
