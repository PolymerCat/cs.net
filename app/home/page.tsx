'use client';

import ProtectedPage from "@/components/protected-page";
import { useEffect, useState } from "react";
import pb from "@/functions/client";

export default function homepage(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => pb.authStore.onChange(() => setIsLoggedIn(pb.authStore.isValid), true), []);

    return(
        <ProtectedPage>
            <div>
                <h1 className="text-3xl font-bold underline">Logged In</h1>
                <p>Welcome, {isLoggedIn ? "User" : "Guest"}!</p>
            </div>
        </ProtectedPage>
    );
}
