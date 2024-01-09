import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

interface SankeyPlotProps {
    data: {
        nodes: {[key:string]:string};
        links: { set: string; value: number }[];
    };
    parentWidth: number;
    parentHeight: number;
}

// SankeyPlot component with mock data
const SankeyPlot: React.FC<SankeyPlotProps> = ({ data, 
                                                 parentWidth, 
                                                 parentHeight }) => {

    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current) return;
        if (data["nodes"].length === 0) return;
        if (data["links"].length === 0) return;
    
        // Clear any previous SVG content
        d3.select(svgRef.current).selectAll('*').remove();
    
        // Set up SVG dimensions
        const width = parentWidth * 15;
        const height = parentHeight * 5;
    
        // Create SVG container
        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
    
        // Set up the Sankey diagram
        const sankeyGenerator = sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([
                [0, 0],
                [width, height],
            ]);
    
        const { nodes, links } = sankeyGenerator(data);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const node = svg.append("g")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr('fill', d => color(d.name))
            .append("title")
            .text(d => `${d.name}\n${d.value}`);

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.7)
            .selectAll("g")
            .data(links)
            .join("g")
            .style("mix-blend-mode", "multiply");
        link.append("path")
            .attr('class', 'link')
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke", "grey")
            .attr("stroke-width", ({width}) => Math.max(1, width))
            .sort((a, b) => b.width - a.width)
            .append("title")
            .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);
    
        // Add node labels
        svg
            .append('g')
            .selectAll('text')
            .data(nodes)
            .enter()
            .append('text')
            .attr('x', d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
            .attr('y', d => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => (d.x0 < width / 2 ? 'start' : 'end'))
            .text(d => d.name);
    
    }, [data,parentWidth,parentHeight]);
    
    return <svg ref={svgRef}></svg>;
};

export default SankeyPlot;