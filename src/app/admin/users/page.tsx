'use client';
import { useState, useEffect } from 'react';
import { getAllUsers, getSiteConfig } from '@/lib/actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserProfile, SiteConfig } from '@/lib/types';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [usersData, configData] = await Promise.all([getAllUsers(), getSiteConfig()]);
            setUsers(usersData);
            setConfig(configData);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    if (isLoading) {
        return <p>Loading users...</p>;
    }

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">User Management</CardTitle>
                <CardDescription>An overview of all registered users on {config?.websiteName || 'your site'}.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="rounded-md border border-primary/10">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-primary/10">
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user.uid} className="border-primary/10">
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-headline">${user.balance.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="border-primary/10">
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
