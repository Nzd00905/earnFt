'use client';

import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import Logo from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/actions';


export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthChange((user) => {
        if (user) {
            router.push('/dashboard');
        }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle>
              Welcome Back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isClient ? <AuthForm mode="login" /> : <div className="h-[212px] flex items-center justify-center"><p>Loading...</p></div>}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
