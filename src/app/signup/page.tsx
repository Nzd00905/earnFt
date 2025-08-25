'use client';
import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import Logo from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { onAuthChange } from '@/lib/actions';
import { useRouter } from 'next/navigation';


export default function SignupPage() {
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
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="glass-card">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl font-bold">
                Create an Account
                </CardTitle>
                <CardDescription>
                Start earning today by creating your AdWallet account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isClient ? <AuthForm mode="signup" /> : <div className="h-[212px] flex items-center justify-center"><p>Loading...</p></div>}
            </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
