
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { onAuthChange } from '@/lib/actions';
import type { UserProfile } from '@/lib/types';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
        if (user) {
            setUser(user);
        } else {
            router.push('/');
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-transparent">
              <p>Loading dashboard...</p>
          </div>
      );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <DashboardHeader user={user} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
