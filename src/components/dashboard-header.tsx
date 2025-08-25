'use client';
import Logo from '@/components/logo';
import { UserNav } from '@/components/user-nav';
import { UserProfile } from '@/lib/types';
import Link from 'next/link';

interface DashboardHeaderProps {
    user: UserProfile | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-secondary/30 backdrop-blur-lg">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
            <Link href="/dashboard">
                <Logo />
            </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <UserNav user={user} />
          </nav>
        </div>
      </div>
    </header>
  );
}
