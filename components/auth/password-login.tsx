'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/functions/client';

interface PasswordLoginProps {
    ic: string;
    onBack: () => void;
}

export default function PasswordLogin({ ic, onBack }: PasswordLoginProps) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            try {
                await pb.collection('users').authWithPassword(ic.trim(), password);
            } catch (err: unknown) {
                // in case PocketBase auth identity requires the user's email, lookup email by username (IC)
                const user = await pb.collection('users').getFirstListItem(`username = "${ic.trim()}"`);
                if (user?.email) {
                    await pb.collection('users').authWithPassword(user.email, password);
                } else {
                    throw err;
                }
            }
            router.push('/home');
        } catch {
            setError('Incorrect password. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="text-center">
                <p className="text-sm text-gray-400">Logging in as</p>
                <p className="text-lg font-bold text-orange-400">{ic}</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-gray-600 bg-black/50 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-gray-500"
                    autoFocus
                    required
                />

                {error && (
                    <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-lg py-2 px-4 text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-orange-400 text-black font-semibold py-3 px-4 rounded-lg hover:bg-orange-300 transition disabled:opacity-50"
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <button
                onClick={onBack}
                className="text-sm text-gray-400 hover:text-white transition"
            >
                ← Use a different IC number
            </button>
        </div>
    );
}
