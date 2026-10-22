'use client';

import TopNav from '@/components/topnav';
import ProtectedPage from '@/components/protected-page';
import { useState, useEffect } from 'react';
import pb from '@/functions/client';
import getUsers from '../api/get-user-list/route';
import {useRef} from 'react';

export default function Page() {

    // const [records, setRecords] = useState([]);
    const hasFetched = useRef(false);


    useEffect(() => {
        if (!hasFetched.current) {
            getUsers();
            hasFetched.current = true;
        }
    }, []);


    return (
        <ProtectedPage>
            <div className="min-h-screen bg-black text-orange-400 font-sans pb-12">
                <TopNav />
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <h1 className="text-3xl font-bold mb-6">User List</h1>
                </div>
            </div>
            
            
        </ProtectedPage>
    );
}