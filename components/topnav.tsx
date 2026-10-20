'use client';

import { useRouter } from 'next/navigation';
import pb from '@/functions/client';

export default function TopNav() {
    const router = useRouter();

    function handleLogout() {
        pb.authStore.clear();
        router.replace('/');
    }

    return (
        <header className="sticky top-0 z-50 bg-orange-400 backdrop-blur-md ">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <span className="text-3xl font-bold tracking-tight text-black">
                    CS.NET
                </span>
                <nav className="hidden md:flex space-x-8 text-sm font-medium text-black">
                    <a
                        href="/home"
                        className="hover:text-indigo-600 transition"
                    >
                        Network
                    </a>
                    <a
                        href="/profile"
                        className="hover:text-indigo-600 transition"
                    >
                        Profile
                    </a>
                </nav>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLogout}
                        className="bg-black text-orange-400 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 hover:text-white cursor-pointer transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
