'use client';

import ProtectedPage from "@/components/protected-page";
import { useEffect, useState } from "react";
import pb from "@/functions/client";

export default function homepage(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    

    useEffect(() => pb.authStore.onChange(() => setIsLoggedIn(pb.authStore.isValid), true), []);
    let username = "user";

    if (isLoggedIn){
        username = pb.authStore.record?.username;
    }

    return(
        <ProtectedPage>
            <div className="min-h-screen bg-black text-orange-400 font-sans">
                <header className="sticky top-0 z-50 bg-orange-400 backdrop-blur-md ">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <span className="text-3xl font-bold tracking-tight text-black">CS.NET</span>
                    <nav className="hidden md:flex space-x-8 text-sm font-medium text-black">
                        <a href="#home" className="hover:text-indigo-600 transition">Alumni</a>
                        <a href="#home" className="hover:text-indigo-600 transition">Companies</a>
                        <a href="#home" className="hover:text-indigo-600 transition">Development</a>
                    </nav>
                    <div className="flex items-center space-x-4">
                        {/* <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</button> */}
                        <button className="bg-black text-orange-400 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                        Logout
                        </button>
                    </div>
                    </div>
                </header>


                <div className=" flex items-center justify-center h-screen">
                    <div className="flex flex-col p-4 gap-4 w-full max-w-md  rounded-lg shadow-lg">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Welcome</h1>
                            <p className="italic">{username}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"> Alumni </button>
                            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"> Profile </button>
                            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"> CS Network </button>
                        </div>
                        


                    </div>
                    <div className="flex flex-col p-4 gap-4 w-full max-w-md  rounded-lg shadow-lg bg-white/15 items-center justify-center">
                        <p>Our growing network of alumni...</p>
                    </div>
                    
                </div>
            </div>
        </ProtectedPage>
    );
}
