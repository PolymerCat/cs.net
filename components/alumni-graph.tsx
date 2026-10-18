'use client';

import { useEffect, useRef } from "react";
import { Network } from "vis-network";
import { DataSet } from "vis-data";

interface AlumniGraphProps {
  nodes: DataSet<any>;
  edges: DataSet<any>;
  onNodeClick: (nodeId: string) => void;
}

export default function AlumniGraph({ nodes, edges, onNodeClick }: AlumniGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  
  const onNodeClickRef = useRef(onNodeClick);
  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  useEffect(() => {
    if (!containerRef.current) return;

    const data = { nodes, edges };
    const options = {
      nodes: {
        shape: "dot",
        font: { color: "#ffffff", size: 14, face: "sans-serif" },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        width: 2,
        color: { color: "#475569", highlight: "#f97316" },
        smooth: { type: "continuous" },
      },
      physics: {
        forceAtlas2Based: {
          gravitationalConstant: -100,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
        },
        maxVelocity: 50,
        solver: "forceAtlas2Based",
        timestep: 0.35,
        stabilization: { iterations: 150 },
      },
      interaction: {
        hover: true,
        tooltipDelay: 200,
      },
    };

    networkRef.current = new Network(containerRef.current, data, options);

    networkRef.current.on("click", (params) => {
      if (params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        onNodeClickRef.current(clickedNodeId);
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [nodes, edges]); 

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] border border-slate-800 rounded-xl overflow-hidden shadow-sm bg-slate-950" 
    />
  );
}