'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/functions/client';
import IcVerification from '@/components/auth/ic-verification';

export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        if (pb.authStore.isValid) {
            const record = pb.authStore.record;
            if (record && record.onboarding_complete === false) {
                router.replace(
                    `/onboarding?ic=${encodeURIComponent(record.username)}`
                );
            } else {
                router.replace('/home');
            }
        }
    }, [router]);

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-black text-white font-sans">
            <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold text-orange-400 tracking-tight">
                        CS.NET
                    </h1>
                    <p className="text-gray-400 mt-2">
                        USM Computer Science Network
                    </p>
                </div>

                <IcVerification />
            </div>
        </div>
    );
}
