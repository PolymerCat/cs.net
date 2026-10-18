'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import pb from '@/functions/client';

export default function ProtectedPage({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsubscribe = pb.authStore.onChange(() => {
            if (!pb.authStore.isValid) {
                router.replace('/');
                return;
            }

            // Block users who haven't completed onboarding
            const record = pb.authStore.record;
            if (record && record.onboarding_complete === false) {
                router.replace(
                    `/onboarding?ic=${encodeURIComponent(record.username)}`
                );
                return;
            }

            setIsReady(true);
        }, true);

        return unsubscribe;
    }, [router]);

    if (!isReady) {
        return null;
    }

    return children;
}