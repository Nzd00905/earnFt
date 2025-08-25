'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, getSiteConfig } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Landmark, Settings, Users, LogOut, Home, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useEffect, useState } from 'react';
import { SiteConfig } from '@/lib/types';


const navItems = [
  { href: '/admin', label: 'Withdrawals', icon: Landmark },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
        const siteConfig = await getSiteConfig();
        setConfig(siteConfig);
    }
    fetchConfig();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r border-primary/10 bg-secondary/30 backdrop-blur-lg sm:flex">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
                href="/admin"
                className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
                <WalletIcon className="h-4 w-4 transition-all group-hover:scale-110" />
                <span className="sr-only">{config?.websiteName}</span>
            </Link>
            {navItems.map((item) => (
                <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
                            pathname === item.href && 'bg-accent text-accent-foreground'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="sr-only">{item.label}</span>
                    </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
            ))}
            </nav>
            <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 md:h-8 md:w-8 text-muted-foreground hover:text-foreground" onClick={() => router.push('/dashboard')}>
                        <Home className="h-5 w-5" />
                        <span className="sr-only">Back to App</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Back to App</TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 md:h-8 md:w-8 text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Sign Out</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
            </nav>
        </TooltipProvider>
    </aside>
     <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden fixed top-4 left-4 z-20 bg-secondary/30 backdrop-blur-lg">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs bg-secondary/50 backdrop-blur-xl border-primary/10">
          <nav className="grid gap-6 text-lg font-medium">
             <Link
                href="/admin"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
                <WalletIcon className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">{config?.websiteName}</span>
            </Link>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", pathname === item.href && 'text-foreground')}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
            ))}
             <Button variant="ghost" className="justify-start gap-4 px-2.5 text-muted-foreground hover:text-foreground" onClick={() => router.push('/dashboard')}>
                <Home className="h-5 w-5" />
                Back to App
            </Button>
             <Button variant="ghost" className="justify-start gap-4 px-2.5 text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                Sign Out
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}


function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}
