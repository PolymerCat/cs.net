"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface TemporalNode extends d3.SimulationNodeDatum {
  id: string;
  start: number; // timestamp or discrete step
  end: number;
}

export interface TemporalLink extends d3.SimulationLinkDatum<TemporalNode> {
  source: string | TemporalNode;
  target: string | TemporalNode;
  start: number;
  end: number;
}

interface TemporalGraphProps {
  data: {
    nodes: TemporalNode[];
    links: TemporalLink[];
  };
  minTime: number;
  maxTime: number;
  timeStep?: number;
}

export default function TemporalForceGraph({
  data,
  minTime,
  maxTime,
  timeStep = 1,
}: TemporalGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(minTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Store mutable D3 instances that persist across renders
  const simulationRef = useRef<d3.Simulation<TemporalNode, TemporalLink> | null>(null);
  const elementsRef = useRef<{
  nodeSelection: d3.Selection<SVGCircleElement, TemporalNode, d3.BaseType, unknown>;
  linkSelection: d3.Selection<SVGLineElement, TemporalLink, d3.BaseType, unknown>;
} | null>(null);

  const width = 800;
  const height = 600;

  // 1. Initialize Graph & Simulation
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clean container on mount

    const g = svg.append("g");

    // Zoom & Pan behavior
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.2, 5])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        })
    );

    const linkGroup = g.append("g").attr("stroke", "#999").attr("stroke-opacity", 0.6);
    const nodeGroup = g.append("g").attr("stroke", "#fff").attr("stroke-width", 1.5);

    const simulation = d3
      .forceSimulation<TemporalNode>()
      .force(
        "link",
        d3.forceLink<TemporalNode, TemporalLink>().id((d) => d.id).distance(40)
      )
      .force("charge", d3.forceManyBody().strength(-80))
      .force("center", d3.forceCenter(0, 0))
      .force("x", d3.forceX(0).strength(0.05))
      .force("y", d3.forceY(0).strength(0.05));

    simulation.on("tick", () => {
      if (!elementsRef.current) return;
      const { nodeSelection, linkSelection } = elementsRef.current;

      nodeSelection
        .attr("cx", (d) => d.x ?? 0)
        .attr("cy", (d) => d.y ?? 0);

      linkSelection
        .attr("x1", (d) => (d.source as TemporalNode).x ?? 0)
        .attr("y1", (d) => (d.source as TemporalNode).y ?? 0)
        .attr("x2", (d) => (d.target as TemporalNode).x ?? 0)
        .attr("y2", (d) => (d.target as TemporalNode).y ?? 0);
    });

    simulationRef.current = simulation;
    elementsRef.current = {
      nodeSelection: nodeGroup.selectAll<SVGCircleElement, TemporalNode>("circle"),
      linkSelection: linkGroup.selectAll<SVGLineElement, TemporalLink>("line"),
    };

    return () => {
      simulation.stop();
    };
  }, []);

  // 2. Playback Timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => (prev >= maxTime ? minTime : prev + timeStep));
    }, 200);

    return () => clearInterval(timer);
  }, [isPlaying, minTime, maxTime, timeStep]);

  // 3. Update active nodes/links at `currentTime`
  useEffect(() => {
    const simulation = simulationRef.current;
    const elements = elementsRef.current;
    if (!simulation || !elements || !svgRef.current) return;

    // Filter nodes and links that span the current slice of time
    const activeNodesData = data.nodes.filter(
      (n) => n.start <= currentTime && currentTime < n.end
    );
    const activeLinksData = data.links.filter(
      (l) => l.start <= currentTime && currentTime < l.end
    );

    // Recycle existing node instances so coordinates/velocities aren't lost
    const oldNodeMap = new Map(
      elements.nodeSelection.data().map((d) => [d.id, d])
    );
    const updatedNodes = activeNodesData.map((d) => ({
      ...(oldNodeMap.get(d.id) || {}),
      ...d,
    }));
    const updatedLinks = activeLinksData.map((d) => ({ ...d }));

    // Rebind simulation
    simulation.nodes(updatedNodes);
    (
      simulation.force("link") as d3.ForceLink<TemporalNode, TemporalLink>
    )?.links(updatedLinks);

    // Warm up the simulation slightly to accommodate additions/removals
    simulation.alpha(0.3).restart();

    // Drag behavior definition
    const drag = d3
      .drag<SVGCircleElement, TemporalNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Update SVG circles
    const svg = d3.select(svgRef.current);
    const nodeGroup = svg.select("g").selectChildren("g:nth-child(2)");
    const linkGroup = svg.select("g").selectChildren("g:nth-child(1)");

    elements.nodeSelection = nodeGroup
      .selectAll<SVGCircleElement, TemporalNode>("circle")
      .data(updatedNodes, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("r", 5)
            .attr("fill", "#3b82f6")
            .call(drag)
            .call((el) => el.append("title").text((d) => d.id)),
        (update) => update,
        (exit) => exit.remove()
      );

    // Update SVG lines
    elements.linkSelection = linkGroup
      .selectAll<SVGLineElement, TemporalLink>("line")
      .data(
        updatedLinks,
        (d) =>
          `${typeof d.source === "object" ? d.source.id : d.source}-${
            typeof d.target === "object" ? d.target.id : d.target
          }`
      )
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("stroke-width", 1.5)
            .attr("stroke", "#94a3b8"),
        (update) => update,
        (exit) => exit.remove()
      );
  }, [currentTime, data]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Playback Controls */}
      <div className="flex items-center gap-4 w-full max-w-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <span className="text-sm font-mono min-w-16">T = {currentTime}</span>

        <input
          type="range"
          min={minTime}
          max={maxTime}
          step={timeStep}
          value={currentTime}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentTime(Number(e.target.value));
          }}
          className="w-full cursor-pointer"
        />
      </div>

      {/* SVG Canvas */}
      <div className="w-full max-w-4xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-950">
        <svg
          ref={svgRef}
          viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
          className="w-full h-auto max-h-[600px] select-none"
        />
      </div>
    </div>
  );
}