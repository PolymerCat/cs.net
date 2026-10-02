'use client';

import ProtectedPage from "@/components/protected-page";
import { useEffect, useState } from "react";
import pb from "@/functions/client";

import TemporalForceGraph, { TemporalNode, TemporalLink } from "@/components/test-node-graph";

export const sampleNodes: TemporalNode[] = [
  // Early Cluster A (Core Founders & Early Team: 0-14)
  { id: "Alice", start: 0, end: 32 },
  { id: "Bob", start: 1, end: 28 },
  { id: "Charlie", start: 2, end: 35 },
  { id: "Diana", start: 3, end: 30 },
  { id: "Evan", start: 4, end: 25 },
  { id: "Fiona", start: 5, end: 22 },
  { id: "George", start: 6, end: 26 },
  { id: "Hannah", start: 7, end: 29 },
  { id: "Ian", start: 8, end: 24 },
  { id: "Julia", start: 9, end: 33 },
  { id: "Kevin", start: 10, end: 27 },
  { id: "Laura", start: 11, end: 36 },
  { id: "Mike", start: 12, end: 28 },
  { id: "Nina", start: 13, end: 31 },
  { id: "Oscar", start: 14, end: 34 },

  // Mid-Phase Cluster B (Expansion & Product Team: 15-29)
  { id: "Paul", start: 15, end: 42 },
  { id: "Quinn", start: 16, end: 45 },
  { id: "Rachel", start: 17, end: 48 },
  { id: "Sam", start: 18, end: 44 },
  { id: "Tina", start: 19, end: 46 },
  { id: "Uma", start: 20, end: 49 },
  { id: "Victor", start: 21, end: 43 },
  { id: "Wendy", start: 22, end: 50 },
  { id: "Xavier", start: 23, end: 47 },
  { id: "Yara", start: 24, end: 50 },
  { id: "Zack", start: 25, end: 48 },
  { id: "Arthur", start: 26, end: 50 },
  { id: "Beatrice", start: 27, end: 49 },
  { id: "Colin", start: 28, end: 45 },
  { id: "Daisy", start: 29, end: 50 },

  // Late-Phase Cluster C (Scale-Up & Specialist Cohort: 30-49)
  { id: "Edward", start: 30, end: 50 },
  { id: "Flora", start: 31, end: 50 },
  { id: "Gabriel", start: 32, end: 50 },
  { id: "Helena", start: 33, end: 50 },
  { id: "Isaac", start: 34, end: 50 },
  { id: "Jasmine", start: 35, end: 50 },
  { id: "Kyle", start: 36, end: 50 },
  { id: "Luna", start: 37, end: 50 },
  { id: "Mason", start: 38, end: 50 },
  { id: "Nora", start: 39, end: 50 },
  { id: "Oliver", start: 40, end: 50 },
  { id: "Penelope", start: 41, end: 50 },
  { id: "Quentin", start: 42, end: 50 },
  { id: "Rosa", start: 43, end: 50 },
  { id: "Simon", start: 44, end: 50 },
  { id: "Tara", start: 45, end: 50 },
  { id: "Uri", start: 46, end: 50 },
  { id: "Valerie", start: 47, end: 50 },
  { id: "Wyatt", start: 48, end: 50 },
  { id: "Xena", start: 49, end: 50 },
];

export const sampleLinks: TemporalLink[] = [
  // Cluster A Internal Links
  { source: "Alice", target: "Bob", start: 2, end: 26 },
  { source: "Alice", target: "Charlie", start: 3, end: 30 },
  { source: "Bob", target: "Diana", start: 4, end: 24 },
  { source: "Charlie", target: "Evan", start: 5, end: 22 },
  { source: "Diana", target: "Fiona", start: 6, end: 20 },
  { source: "Evan", target: "George", start: 7, end: 23 },
  { source: "Fiona", target: "Hannah", start: 8, end: 21 },
  { source: "George", target: "Ian", start: 9, end: 22 },
  { source: "Hannah", target: "Julia", start: 10, end: 27 },
  { source: "Ian", target: "Kevin", start: 11, end: 23 },
  { source: "Julia", target: "Laura", start: 12, end: 31 },
  { source: "Kevin", target: "Mike", start: 13, end: 25 },
  { source: "Laura", target: "Nina", start: 14, end: 29 },
  { source: "Mike", target: "Oscar", start: 15, end: 26 },
  { source: "Alice", target: "Diana", start: 5, end: 28 },
  { source: "Charlie", target: "Hannah", start: 8, end: 26 },
  { source: "Evan", target: "Laura", start: 13, end: 24 },
  { source: "Julia", target: "Oscar", start: 16, end: 32 },

  // Cluster A -> Cluster B Bridge Links
  { source: "Charlie", target: "Paul", start: 16, end: 33 },
  { source: "Laura", target: "Quinn", start: 17, end: 34 },
  { source: "Oscar", target: "Rachel", start: 18, end: 32 },
  { source: "Julia", target: "Sam", start: 19, end: 30 },
  { source: "Alice", target: "Tina", start: 20, end: 31 },

  // Cluster B Internal Links
  { source: "Paul", target: "Quinn", start: 17, end: 40 },
  { source: "Quinn", target: "Rachel", start: 18, end: 43 },
  { source: "Rachel", target: "Sam", start: 19, end: 42 },
  { source: "Sam", target: "Tina", start: 20, end: 41 },
  { source: "Tina", target: "Uma", start: 21, end: 45 },
  { source: "Uma", target: "Victor", start: 22, end: 42 },
  { source: "Victor", target: "Wendy", start: 23, end: 42 },
  { source: "Wendy", target: "Xavier", start: 24, end: 46 },
  { source: "Xavier", target: "Yara", start: 25, end: 46 },
  { source: "Yara", target: "Zack", start: 26, end: 47 },
  { source: "Zack", target: "Arthur", start: 27, end: 47 },
  { source: "Arthur", target: "Beatrice", start: 28, end: 48 },
  { source: "Beatrice", target: "Colin", start: 29, end: 44 },
  { source: "Colin", target: "Daisy", start: 30, end: 44 },
  { source: "Paul", target: "Wendy", start: 23, end: 41 },
  { source: "Rachel", target: "Yara", start: 26, end: 44 },
  { source: "Tina", target: "Arthur", start: 28, end: 45 },

  // Cluster B -> Cluster C Bridge Links
  { source: "Wendy", target: "Edward", start: 31, end: 48 },
  { source: "Yara", target: "Flora", start: 32, end: 49 },
  { source: "Arthur", target: "Gabriel", start: 33, end: 48 },
  { source: "Daisy", target: "Helena", start: 34, end: 49 },

  // Cluster C Internal Links
  { source: "Edward", target: "Flora", start: 32, end: 50 },
  { source: "Flora", target: "Gabriel", start: 33, end: 50 },
  { source: "Gabriel", target: "Helena", start: 34, end: 50 },
  { source: "Helena", target: "Isaac", start: 35, end: 50 },
  { source: "Isaac", target: "Jasmine", start: 36, end: 50 },
  { source: "Jasmine", target: "Kyle", start: 37, end: 50 },
  { source: "Kyle", target: "Luna", start: 38, end: 50 },
  { source: "Luna", target: "Mason", start: 39, end: 50 },
  { source: "Mason", target: "Nora", start: 40, end: 50 },
  { source: "Nora", target: "Oliver", start: 41, end: 50 },
  { source: "Oliver", target: "Penelope", start: 42, end: 50 },
  { source: "Penelope", target: "Quentin", start: 43, end: 50 },
  { source: "Quentin", target: "Rosa", start: 44, end: 50 },
  { source: "Rosa", target: "Simon", start: 45, end: 50 },
  { source: "Simon", target: "Tara", start: 46, end: 50 },
  { source: "Tara", target: "Uri", start: 47, end: 50 },
  { source: "Uri", target: "Valerie", start: 48, end: 50 },
  { source: "Valerie", target: "Wyatt", start: 49, end: 50 },
  { source: "Wyatt", target: "Xena", start: 50, end: 50 },
  { source: "Edward", target: "Isaac", start: 36, end: 50 },
  { source: "Gabriel", target: "Luna", start: 39, end: 50 },
  { source: "Jasmine", target: "Oliver", start: 42, end: 50 },
  { source: "Luna", target: "Rosa", start: 45, end: 50 },
];

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



                    <div className="flex flex-col p-4 gap-4 w-full max-w-md  rounded-lg shadow-lg  items-center justify-center">
                        <p>Our growing network of alumni...</p>
                        <TemporalForceGraph
                            data={{ nodes: sampleNodes, links: sampleLinks }}
                            minTime={0}
                            maxTime={20}
                            timeStep={1}
                        />
                    </div>
                    
                </div>
            </div>
        </ProtectedPage>
    );
}
