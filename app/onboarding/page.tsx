'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import OnboardingForm from '@/components/auth/onboarding-form';

function OnboardingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [ic, setIc] = useState<string | null>(null);

    useEffect(() => {
        const icParam = searchParams.get('ic');
        if (!icParam) {
            router.replace('/');
            return;
        }
        setIc(icParam);
    }, [searchParams, router]);

    if (!ic) return null;

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md px-6">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-orange-400 tracking-tight">
                    Welcome to CS.NET
                </h1>
                <p className="text-gray-400 mt-2">
                    Complete your profile to get started
                </p>
                <p className="text-xs text-gray-500 mt-1">IC: {ic}</p>
            </div>

            <OnboardingForm ic={ic} />
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-black text-white font-sans py-12">
            <Suspense>
                <OnboardingContent />
            </Suspense>
        </div>
    );
}
