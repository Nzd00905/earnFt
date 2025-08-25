'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { onAuthChange } from '@/lib/actions';
import type { UserProfile } from '@/lib/types';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (user?.role === 'admin') {
                setIsAuthorized(true);
            } else if (user) {
                router.push('/dashboard');
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
                <p>Verifying access...</p>
            </div>
        );
    }
    
    if (!isAuthorized) {
        return null;
    }


  return (
    <div className="flex min-h-screen w-full bg-transparent">
      <AdminSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
        {children}
      </div>
      <Toaster />
    </div>
  );
}
