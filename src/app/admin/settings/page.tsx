'use client';
import { useEffect, useState } from 'react';
import { getSiteConfig } from '@/lib/actions';
import { SettingsForm } from '@/components/admin/settings-form';
import type { SiteConfig } from '@/lib/types';

export default function AdminSettingsPage() {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            const siteConfig = await getSiteConfig();
            setConfig(siteConfig);
            setIsLoading(false);
        }
        fetchConfig();
    }, []);

    if (isLoading) {
        return <p>Loading settings...</p>;
    }

    return <SettingsForm config={config} />;
}
