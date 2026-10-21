'use client';

import TopNav from "@/components/topnav";
import ProtectedPage from "@/components/protected-page";
import { useEffect, useState, useRef, useCallback } from "react";
import pb from "@/functions/client";
import { DataSet } from "vis-data";
import AlumniGraph from "@/components/alumni-graph";
import Image from "next/image";

export default function Homepage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("user");
    const [isLoadingNode, setIsLoadingNode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const nodesRef = useRef(new DataSet([
        { id: "CS", label: "Computer Science", color: "#f97316", size: 40, font: { size: 20 } },
        { id: "SE", label: "Software Engineering", color: "#f63b3b", size: 30 },
        { id: "CI", label: "Computing Infrastructure", color: "#189bf3", size: 30 },
        { id: "IC", label: "Intelligent Computing", color: "#1aee2c", size: 30 },
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

    const programMap: Record<string, string> = {
        "SE": "Software Engineering",
        "CI": "Computing Infrastructure",
        "IC": "Intelligent Computing"
    };

    const addStudentNode = (student: any, programShort: string) => {
        const nodes = nodesRef.current;
        const edges = edgesRef.current;
        const studentNodeId = `student-${student.id}`;
        const batchNodeId = `${programShort}-${student.batch}`;

        if (!nodes.get(studentNodeId)) {
            const ic = student.expand?.user_id?.username; 
            const imageUrl = ic 
                ? `https://campusonline2.usm.my/photo/StudentPic/${ic}.jpg` 
                : "https://ui-avatars.com/api/?name=" + encodeURIComponent(student.full_name); // Fallback

            nodes.add({
                id: studentNodeId,
                label: student.full_name,
                shape: "circularImage",
                image: imageUrl,
                size: 25,
                title: `Batch: ${student.batch}`
            });

            if (!nodes.get(batchNodeId)) {
                nodes.add({ id: batchNodeId, label: `Batch ${student.batch}`, color: "#eab308", size: 20 });
                edges.add({ id: `edge-${programShort}-${batchNodeId}`, from: programShort, to: batchNodeId });
            }

            edges.add({
                id: `edge-${batchNodeId}-${studentNodeId}`,
                from: batchNodeId,
                to: studentNodeId
            });
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setIsLoadingNode(true);
        try {
            const records = await pb.collection('profile').getList(1, 5, {
                filter: `full_name ~ "${searchQuery}"`,
                expand: 'user_id' 
            });

            records.items.forEach(student => {
                const programShort = Object.keys(programMap).find(key => programMap[key] === student.program) || "SE";
                addStudentNode(student, programShort);
            });
            setSearchQuery("");
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoadingNode(false);
        }
    };

    const getAllDescendants = (startNodeId: string, edges: DataSet<any>) => {
        const descendantNodeIds: string[] = [];
        const descendantEdgeIds: string[] = [];
        const queue = [startNodeId];

        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const childEdges = edges.get({
                filter: (item) => item.from === currentId
            });

            childEdges.forEach((edge: any) => {
                descendantNodeIds.push(edge.to);
                descendantEdgeIds.push(edge.id);
                queue.push(edge.to);
            });
        }

        return { descendantNodeIds, descendantEdgeIds };
    };

    const handleNodeClick = useCallback(async (nodeId: string) => {
        const nodes = nodesRef.current;
        const edges = edgesRef.current;

        if (nodeId.startsWith("student-")) {
            const studentId = nodeId.replace("student-", "");
            try {
                const profileRecord = await pb.collection('profile').getOne(studentId, {
                    expand: 'user_id'
                });
                setSelectedStudent(profileRecord);
                setIsModalOpen(true);
            } catch (error) {
                console.error("Failed to load student profile:", error);
            }
            return;
        }

        const { descendantNodeIds, descendantEdgeIds } = getAllDescendants(nodeId, edges);
        
        if (descendantNodeIds.length > 0) {
            nodes.remove(descendantNodeIds);
            edges.remove(descendantEdgeIds);
            return; 
        }

        setIsLoadingNode(true);

        try {
            if (["SE", "CI", "IC"].includes(nodeId)) {
                const dbProgramName = programMap[nodeId];
                const records = await pb.collection('profile').getList(1, 50, {
                    filter: `program="${dbProgramName}"`,
                    fields: 'batch'
                });

                const uniqueBatches = Array.from(new Set(records.items.map(r => r.batch).filter(Boolean)));
                uniqueBatches.forEach(batch => {
                    const batchNodeId = `${nodeId}-${batch}`;
                    if (!nodes.get(batchNodeId)) {
                        nodes.add({ id: batchNodeId, label: `Batch ${batch}`, color: "#eab308", size: 20 });
                        edges.add({ id: `edge-${nodeId}-${batchNodeId}`, from: nodeId, to: batchNodeId });
                    }
                });
            }
            else if (nodeId.includes("-") && !nodeId.startsWith("edge")) {
                const [programShort, batch] = nodeId.split("-");
                const dbProgramName = programMap[programShort];
                
                const students = await pb.collection('profile').getList(1, 20, {
                    filter: `program="${dbProgramName}" && batch="${batch}"`,
                    expand: 'user_id'
                });

                students.items.forEach(student => addStudentNode(student, programShort));
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
                    <div className="flex flex-col p-6 gap-4 w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
                        <div className="flex flex-wrap justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Welcome</h1>
                                <p className="italic text-slate-400">{username}</p>
                            </div>
                            
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Find student by name..." 
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-orange-500"
                                />
                                <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
                                    Search
                                </button>
                            </form>
                        </div>
                        <div className="flex gap-4 flex-wrap mt-4">
                            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"> Alumni </button>
                            <button className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition"> Profile </button>
                            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"> CS Network </button>
                        </div>
                    </div>

                    <div className="flex flex-col p-4 w-full max-w-4xl rounded-lg shadow-lg">
                        <div className="flex flex-wrap justify-between items-center mb-4">
                            <p className="text-slate-300">Our growing network of alumni...</p>
                            {isLoadingNode && <span className="text-sm text-orange-400 animate-pulse">Loading data...</span>}
                        </div>
                        
                        <AlumniGraph 
                            nodes={nodesRef.current} 
                            edges={edgesRef.current} 
                            onNodeClick={handleNodeClick} 
                        />
                    </div>
                </div>
            </div>
            {/* Student Profile Modal */}
            {isModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                        {/* Close Button */}
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                        >
                            ✕
                        </button>

                        <div className="flex flex-col items-center gap-4">
                            {/* Profile Image */}
                            <Image 
                                src={selectedStudent.expand?.user_id?.username 
                                    ? `https://campusonline2.usm.my/photo/StudentPic/${selectedStudent.expand.user_id.username}.jpg`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.full_name)}&background=random`}
                                alt={selectedStudent.full_name}
                                width={96}
                                height={96}
                                className="w-24 h-24 rounded-full border-4 border-slate-700 object-cover bg-slate-800"
                                onError={(e) => {
                                    e.currentTarget.srcset = "";
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.full_name)}&background=random`;
                                }}
                            />

                            {/* Header Info */}
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white">{selectedStudent.full_name}</h2>
                                <p className="text-orange-400 font-medium">
                                    {selectedStudent.program} • Batch {selectedStudent.batch}
                                </p>
                                <span className="inline-block mt-1 px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                                    {selectedStudent.academic_status}
                                </span>
                            </div>

                            {/* Bio & Job Title */}
                            <div className="w-full text-sm text-slate-300 space-y-3 mt-2">
                                {selectedStudent.academic_status?.toLowerCase() === 'alumni' && selectedStudent.job_title && (
                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                        <p className="font-semibold text-white mb-1">Current Role</p>
                                        <p>{selectedStudent.job_title}</p>
                                    </div>
                                )}
                                
                                {selectedStudent.bio && (
                                    <div>
                                        <p className="font-semibold text-white mb-1">About</p>
                                        <p className="italic text-slate-400">"{selectedStudent.bio}"</p>
                                    </div>
                                )}
                                
                                {selectedStudent.interests && (
                                    <div>
                                        <p className="font-semibold text-white mb-1">Interests</p>
                                        <p>{selectedStudent.interests}</p>
                                    </div>
                                )}
                            </div>

                            {/* Contact & Links */}
                            <div className="w-full grid grid-cols-1 gap-2 mt-4 text-sm">
                                {selectedStudent.personal_email && (
                                    <a href={`mailto:${selectedStudent.personal_email}`} className="flex items-center gap-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition">
                                        📧 {selectedStudent.personal_email}
                                    </a>
                                )}
                                {selectedStudent.phone && (
                                    <a href={`tel:${selectedStudent.phone}`} className="flex items-center gap-2 p-2 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 transition">
                                        📱 {selectedStudent.phone}
                                    </a>
                                )}
                                {selectedStudent.linkedin_url && (
                                    <a href={selectedStudent.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50 transition">
                                        🔗 LinkedIn
                                    </a>
                                )}
                                {selectedStudent.portfolio_url && (
                                    <a href={selectedStudent.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-orange-900/30 text-orange-400 rounded hover:bg-orange-900/50 transition">
                                        🌐 Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedPage>
    );
}