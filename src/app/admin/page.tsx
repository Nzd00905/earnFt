'use client';

import { useState, useEffect } from 'react';
import { getWithdrawalRequests, completeWithdrawal, getAllUsers } from '@/lib/actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WithdrawalRequest, UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';


function CompleteButton({ requestId, onComplete }: { requestId: string, onComplete: () => void }) {
    const handleComplete = async () => {
        await completeWithdrawal(requestId);
        onComplete();
    };
    return (
        <Button size="sm" onClick={handleComplete}>Mark as Complete</Button>
    );
}

export default function AdminDashboardPage() {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = async () => {
        setIsLoading(true);
        const [requestsData, usersData] = await Promise.all([getWithdrawalRequests(), getAllUsers()]);
        setRequests(requestsData);
        setUsers(usersData);
        setIsLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const completedRequests = requests.filter(r => r.status === 'completed');
    
    const totalBalance = users.reduce((acc, user) => acc + user.balance, 0);
    const totalUsers = users.length;
    const pendingCount = pendingRequests.length;
    const totalWithdrawals = completedRequests.reduce((acc, req) => acc + req.amount, 0);
    
    const chartData = requests
        .map(r => ({ date: new Date(r.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount: r.amount }))
        .reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date);
            if (existing) {
                existing.amount += curr.amount;
            } else {
                acc.push({ date: curr.date, amount: curr.amount });
            }
            return acc;
        }, [] as {date: string, amount: number}[]).reverse();

    const chartConfig = {
        amount: {
            label: "Amount ($)",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-transparent">
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total User Balance
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Sum of all user balances
                    </p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Registered Users
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      Total active users
                    </p>
                  </CardContent>
                </Card>
                 <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">
                      Requests needing review
                    </p>
                  </CardContent>
                </Card>
                 <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalWithdrawals.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Total amount paid out to users
                    </p>
                  </CardContent>
                </Card>
            </div>
             <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Withdrawal Activity</CardTitle>
                    <CardDescription>A summary of withdrawal requests over the last few days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.2)" vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis strokeWidth={1} tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Tabs defaultValue="pending">
            <div className="flex items-center">
                <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="pending">
                <Card className="glass-card">
                    <CardHeader className="px-7">
                        <CardTitle>Pending Withdrawals</CardTitle>
                        <CardDescription>Review and process these withdrawal requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-primary/10">
                                    <TableHead>User Email</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Fee TX ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingRequests.length > 0 ? (
                                    pendingRequests.map((req) => (
                                        <TableRow key={req.id} className="border-primary/10">
                                            <TableCell>{req.userEmail}</TableCell>
                                            <TableCell>${req.amount.toFixed(2)}</TableCell>
                                            <TableCell className="font-mono text-xs">{req.feeTxId}</TableCell>
                                            <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <CompleteButton requestId={req.id} onComplete={fetchData} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-primary/10">
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No pending requests.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="completed">
                <Card className="glass-card">
                    <CardHeader  className="px-7">
                        <CardTitle>Completed Withdrawals</CardTitle>
                        <CardDescription>A record of all processed withdrawals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-primary/10">
                                    <TableHead>User Email</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Completed Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {completedRequests.length > 0 ? (
                                    completedRequests.map((req) => (
                                        <TableRow key={req.id} className="border-primary/10">
                                            <TableCell>{req.userEmail}</TableCell>
                                            <TableCell>${req.amount.toFixed(2)}</TableCell>
                                            <TableCell><Badge>Completed</Badge></TableCell>
                                            <TableCell>{req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-primary/10">
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No completed withdrawals yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
    </main>
    );
}
