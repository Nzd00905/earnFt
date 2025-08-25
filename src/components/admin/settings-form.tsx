'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateSiteConfig } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

const formSchema = z.object({
    websiteName: z.string().min(1, 'Website name is required.'),
    withdrawalFee: z.coerce.number().min(0, 'Fee must be non-negative.'),
    feeTokenName: z.string().min(1, 'Token name is required.'),
    adCreditAmount: z.coerce.number().min(0, 'Credit must be non-negative.'),
    feeDepositAddress: z.string().min(1, 'Deposit address is required.'),
    claimCooldownSeconds: z.coerce.number().int().min(0, 'Cooldown must be a non-negative integer.'),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export function SettingsForm({ config }: { config: SiteConfig | null }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            websiteName: config?.websiteName ?? 'AdWallet',
            withdrawalFee: config?.withdrawalFee ?? 1,
            feeTokenName: config?.feeTokenName ?? 'USDT',
            adCreditAmount: config?.adCreditAmount ?? 0.5,
            feeDepositAddress: config?.feeDepositAddress ?? '',
            claimCooldownSeconds: config?.claimCooldownSeconds ?? 30,
        },
    });

    const onSubmit = async (values: SettingsFormValues) => {
        setIsLoading(true);
        try {
            await updateSiteConfig(values);
            toast({
                title: 'Settings Updated',
                description: 'The site configuration has been saved successfully.',
            });
             // Force a reload to reflect the new name everywhere
            window.location.reload();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Site Settings</CardTitle>
                <CardDescription>Manage global settings for the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="websiteName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Website Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Site Name" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="adCreditAmount"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Ad View Credit Amount ($)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0.50" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="claimCooldownSeconds"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Token Claim Cooldown (seconds)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="1" placeholder="30" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="withdrawalFee"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Withdrawal Fee Amount</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="1.00" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        
                            <FormField
                                    control={form.control}
                                    name="feeTokenName"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Fee Token Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="USDT" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                        </div>
                        <FormField
                            control={form.control}
                            name="feeDepositAddress"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Fee Deposit Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the wallet address for fee deposits" {...field} disabled={isLoading} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading} className="font-bold">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
