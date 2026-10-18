'use client';

import TopNav from "@/components/topnav";
import ProtectedPage from "@/components/protected-page";
import { useEffect, useState, useRef, useCallback } from "react";
import pb from "@/functions/client";
import { DataSet } from "vis-data";
import AlumniGraph from "@/components/alumni-graph";

export default function Homepage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("user");
    const [isLoadingNode, setIsLoadingNode] = useState(false);

    const nodesRef = useRef(new DataSet([
        { id: "CS", label: "Computer Science", color: "#f97316", size: 40, font: { size: 20 } },
        { id: "SE", label: "Software Engineering", color: "#3b82f6", size: 30 },
        { id: "CI", label: "Computing Infrastructure", color: "#10b981", size: 30 },
        { id: "IC", label: "Intelligent Computing", color: "#8b5cf6", size: 30 },
    ]));
    
    const edgesRef = useRef(new DataSet([
        { id: "edge-CS-SE", from: "CS", to: "SE" },
        { id: "edge-CS-CI", from: "CS", to: "CI" },
        { id: "edge-CS-IC", from: "CS", to: "IC" },
    ]));

    useEffect(() => pb.authStore.onChange(() => setIsLoggedIn(pb.authStore.isValid), true), []);
    useEffect(() => {
        if (isLoggedIn && pb.authStore.record?.id) {
            pb.collection('profile')
                .getFirstListItem(`user_id = "${pb.authStore.record.id}"`)
                .then(model => setUsername(model.full_name))
                .catch(() => setUsername(pb.authStore.record?.username || "user"));
        } else {
            setUsername("user");
        }
    }, [isLoggedIn]);

    const handleNodeClick = useCallback(async (nodeId: string) => {
        setIsLoadingNode(true);
        const nodes = nodesRef.current;
        const edges = edgesRef.current;

        // map short IDs to actual database values
        const programMap: Record<string, string> = {
            "SE": "Software Engineering",
            "CI": "Computing Infrastructure",
            "IC": "Intelligent Computing"
        };

        try {
            if (["SE", "CI", "IC"].includes(nodeId)) {
                const dbProgramName = programMap[nodeId];
                
                const records = await pb.collection('profile').getList(1, 50, {
                    filter: `program="${dbProgramName}"`,
                    fields: 'batch'
                });


                console.log(`Found ${records.items.length} records for ${dbProgramName}`);

                const uniqueBatches = Array.from(new Set(records.items.map(r => r.batch).filter(Boolean)));

                uniqueBatches.forEach(batch => {
                    const batchNodeId = `${nodeId}-${batch}`;
                    if (!nodes.get(batchNodeId)) {
                        nodes.add({
                            id: batchNodeId,
                            label: `Batch ${batch}`,
                            color: "#eab308",
                            size: 20
                        });
                        edges.add({
                            id: `edge-${nodeId}-${batchNodeId}`,
                            from: nodeId,
                            to: batchNodeId
                        });
                    }
                });
            }
            else if (nodeId.includes("-") && !nodeId.startsWith("edge")) {
                const [programShort, batch] = nodeId.split("-");
                const dbProgramName = programMap[programShort]; // Get full name
                
                const students = await pb.collection('profile').getList(1, 100, {
                    filter: `program="${dbProgramName}" && batch="${batch}"`
                });

                students.items.forEach(student => {
                    const studentNodeId = `student-${student.id}`;
                    if (!nodes.get(studentNodeId)) {
                        nodes.add({
                            id: studentNodeId,
                            label: student.full_name,
                            color: "#cbd5e1",
                            size: 15,
                            title: `Click to view profile`
                        });
                        edges.add({
                            id: `edge-${nodeId}-${studentNodeId}`,
                            from: nodeId,
                            to: studentNodeId
                        });
                    }
                });
            }
        } catch (error) {
            console.error("Failed to load node data:", error);
        } finally {
            setIsLoadingNode(false);
        }
    }, []);

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-black text-orange-400 font-sans">
                <TopNav />
                
                <div className="flex flex-col items-center justify-center p-8 gap-8">
                    {/* Header Section */}
                    <div className="flex flex-col p-6 gap-4 w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Welcome</h1>
                            <p className="italic text-slate-400">{username}</p>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"> Alumni </button>
                            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"> Profile </button>
                            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"> CS Network </button>
                        </div>
                    </div>

                    {/* Graph Section */}
                    <div className="flex flex-col p-4 w-full max-w-4xl rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-slate-300">Our growing network of alumni...</p>
                            {isLoadingNode && <span className="text-sm text-orange-400 animate-pulse">Loading data...</span>}
                        </div>
                        
                        <AlumniGraph 
                            nodes={nodesRef.current} 
                            edges={edgesRef.current} 
                            onNodeClick={handleNodeClick} 
                        />
                        
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Click on a Program (e.g. SE) to reveal Batches, and click a Batch to reveal Students.
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}