'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/functions/client';
import PasswordLogin from './password-login';

export default function IcVerification() {
    const router = useRouter();
    const [ic, setIc] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<
        'idle' | 'loading' | 'found' | 'not-found' | 'error' | 'confirmed'
    >('idle');
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const verifyStudent = useCallback(async (icNumber: string) => {
        if (!icNumber.trim()) {
            setStatus('idle');
            setPhotoUrl(null);
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch(
                `/api/verify-student?ic=${encodeURIComponent(icNumber)}`
            );

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setPhotoUrl(url);
                setStatus('found');
            } else {
                setPhotoUrl(null);
                setStatus('not-found');
            }
        } catch {
            setPhotoUrl(null);
            setStatus('error');
        }
    }, []);

    function handleIcChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setIc(value);
        setStatus('idle');
        setPhotoUrl(null);
        setShowPasswordLogin(false);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => verifyStudent(value), 600);
    }

    function handleBlur() {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (ic.trim()) verifyStudent(ic);
    }

    async function handleConfirmYes() {
        setStatus('confirmed');

        try {
            let exists = false;
            try {
                const res = await fetch(`/api/check-user?ic=${encodeURIComponent(ic.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    exists = Boolean(data.exists);
                }
            } catch {
                // Client-side fallback: direct check via PocketBase
                try {
                    const record = await pb.collection('users').getFirstListItem(`username = "${ic.trim()}"`);
                    exists = Boolean(record);
                    console.log("lamo")
                } catch {
                    exists = false;
                    console.log('failed', ic)
                }
            }

            if (exists) {
                setShowPasswordLogin(true);
            } else {
                router.push(`/onboarding?ic=${encodeURIComponent(ic.trim())}`);
            }
        } catch {
            setStatus('error');
        }
    }

    function handleConfirmNo() {
        setIc('');
        setPhotoUrl(null);
        setStatus('idle');
        setShowPasswordLogin(false);
    }

    if (showPasswordLogin) {
        return <PasswordLogin ic={ic} onBack={handleConfirmNo} />;
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="w-full">
                <label
                    htmlFor="ic-input"
                    className="block text-sm font-medium mb-2"
                >
                    Student IC Number
                </label>
                <input
                    id="ic-input"
                    type="text"
                    value={ic}
                    onChange={handleIcChange}
                    onBlur={handleBlur}
                    disabled={status === 'found' || status === 'confirmed' || status === 'loading'}
                    placeholder="Enter your IC number"
                    className="w-full border border-gray-600 bg-black/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus
                />
            </div>

            {status === 'loading' && (
                <div className="flex items-center gap-2 text-gray-400">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    Verifying...
                </div>
            )}

            {status === 'not-found' && (
                <div className="text-red-400 text-sm font-medium bg-red-400/10 border border-red-400/30 rounded-lg py-3 px-4 w-full text-center">
                    Invalid IC or Student not found
                </div>
            )}

            {status === 'error' && (
                <div className="text-red-400 text-sm font-medium bg-red-400/10 border border-red-400/30 rounded-lg py-3 px-4 w-full text-center">
                    Something went wrong. Please try again.
                </div>
            )}

            {status === 'found' && photoUrl && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-40 h-48 rounded-lg overflow-hidden border-2 border-orange-400 shadow-lg shadow-orange-400/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photoUrl}
                            alt="Student photo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-lg font-semibold">Is this you?</p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleConfirmYes}
                            className="bg-orange-400 text-black font-semibold py-2 px-8 rounded-lg hover:bg-orange-300 transition"
                        >
                            Yes
                        </button>
                        <button
                            onClick={handleConfirmNo}
                            className="bg-gray-700 text-white font-semibold py-2 px-8 rounded-lg hover:bg-gray-600 transition"
                        >
                            No
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
