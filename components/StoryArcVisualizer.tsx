
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { StoryTree } from '../types';

interface StoryArcVisualizerProps {
  tree: StoryTree;
  currentNodeId: string;
}

export const StoryArcVisualizer: React.FC<StoryArcVisualizerProps> = ({ tree, currentNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !tree) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = svg.node()!.getBoundingClientRect();
    
    // Convert our flat structure to a hierarchical one D3 can use
    const root = d3.stratify()
        .id(d => d.id)
        .parentId(d => d.parentId)
        (Object.values(tree.nodes));

    const treeLayout = d3.tree().size([height - 40, width - 120]);
    const treeData = treeLayout(root);

    const g = svg.append("g").attr("transform", "translate(40,20)");

    // Links
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#4a5568") // gray-700
      .attr("stroke-width", 1.5)
      .attr("d", d3.linkHorizontal()
          .x(d => (d as any).y)
          .y(d => (d as any).x) as any
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => `translate(${(d as any).y},${(d as any).x})`);

    node.append("circle")
      .attr("r", 6)
      .attr("fill", d => (d.id === currentNodeId ? "#818cf8" : "#4a5568")) // indigo-400 vs gray-700
      .attr("stroke", d => (d.id === currentNodeId ? "#a78bfa" : "#718096")) // purple-400 vs gray-500
      .attr("stroke-width", 2);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -12 : 12)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => (d.data as any).choiceText.length > 15 ? (d.data as any).choiceText.substring(0, 12) + '...' : (d.data as any).choiceText)
      .style("fill", "#cbd5e0") // gray-300
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

  }, [tree, currentNodeId]);

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
};
