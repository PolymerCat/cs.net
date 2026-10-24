'use client';

import { useRouter } from 'next/navigation';
import pb from '@/functions/client';
import Image from 'next/image';
import { useState } from 'react';

export default function TopNav() {
    const router = useRouter();

    function handleLogout() {
        pb.authStore.clear();
        router.replace('/');
    }

    const showMobileMenu = () => {
        setShowMobile(true)
    }
    const hideMobileMenu = () => {
        setShowMobile(false)
    }

    const [showMobile, setShowMobile] = useState(false)

    return (
        <>
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
                            Home
                        </a>
                        <a
                            href="/database"
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
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={handleLogout}
                            className="bg-black text-orange-400 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 hover:text-white cursor-pointer transition"
                        >
                            Logout
                        </button>
                    </div>
                    <div className="flex md:hidden items-center space-x-4">
                        <button
                            onClick={showMobileMenu}
                            className=" text-black text-sm font-medium py-2 rounded-lg cursor-pointer transition"
                        >
                            <Image
                                src="/icons/burger-menu.svg"
                                alt="LinkedIn logo"
                                title="LinkedIn"
                                width={64}
                                height={64}
                                priority
                                className="h-8 w-8 sm:h-7 sm:w-7"
                            />
                        </button>
                    </div>
                </div>

            </header>
            {/* Mobile Sidebar */}
            <div 
                className={`fixed top-0 left-0 h-screen w-screen bg-[rgba(0,0,0,0.5)] z-[60] transition ${showMobile ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} md:pointer-events-none md:opacity-0`}
                onClick={() => hideMobileMenu()}
            >
                <div
                    className={`absolute top-0 left-0 bg-slate-800 h-screen flex flex-col gap-3 p-4 px-5 transition ${showMobile ? "translate-x-0" : "-translate-x-100"}`}
                    style={{width:"250px"}}
                    onClick={e => e.stopPropagation()}
                >
                    <button className='self-end' onClick={hideMobileMenu}>
                        <Image
                            src="/icons/close.svg"
                            alt="LinkedIn logo"
                            title="LinkedIn"
                            width={64}
                            height={64}
                            priority
                            className="h-6 w-6 sm:h-7 sm:w-7 text-orange-400"
                        />
                    </button>
                    <a href="/home">Home</a>
                    <a href="/database">Network</a>
                    <a href="/profile">Profile</a>
                    <button
                        onClick={handleLogout}
                        className="text-black bg-orange-400 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 hover:text-white cursor-pointer transition"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}
