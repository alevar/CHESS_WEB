import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import './UpsetPlot.css';

interface UpsetPlotDataProps {
    data: {
        sets: { [key: string]: string };
        intersections: { set: string; value: number }[];
    };
    selectedIntersections: number[];
    onIntersectionClick: (ixData: { set: any, intersection: any, index: number }) => void;
    width: number;
    height: number;
}

const UpsetPlot: React.FC<UpsetPlotDataProps> = ({ data,
    selectedIntersections,
    onIntersectionClick,
    width,
    height, }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const [hoveredIntersection, setHoveredIntersection] = useState<string | null>(null);

    const handleIntersectionHover = (ixData: { set: any, intersection: any, index: number } | null) => {
        setHoveredIntersection(ixData?.intersection.set);
    };

    useEffect(() => {
        if (!svgRef.current || !tooltipRef.current) return;

        // Sections
        const label_y = 0;
        const label_x = 0;
        const label_height = height * 0.1;
        const label_width = width;

        const dot_y = label_height;
        const dot_x = 0;
        const dot_height = height - label_height;
        const dot_width = width * 0.5;

        const spacer = 0.025;
        const spacer_height = height * spacer;
        const spacer_width = width * spacer;

        const bar_y = label_height;
        const bar_x = dot_width + spacer_width;
        const bar_height = height - label_height;
        const bar_width = width - dot_width - spacer_width;

        // Individual cells
        const cell_width = dot_width / Object.keys(data.sets).length;
        const cell_height = dot_height / data.intersections.length;

        // Bars
        const maxValue = d3.max(data.intersections, (d) => d.value);
        const normalizedValues = data.intersections.map((d) => (d.value / maxValue) * bar_width);

        const svg = d3
            .select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Clear previous content
        svg.selectAll("*").remove();

        // Draw a bounding rectangle
        svg
            .append('rect')
            .attr('x', dot_x)
            .attr('y', dot_y)
            .attr('width', dot_width)
            .attr('height', dot_height)
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .style('fill', 'none');

        // Create rectangles for each intersection (behind circles)
        svg
            .selectAll('rect.gridCell')
            .data(data.intersections)
            .enter()
            .append('g')
            .attr('class', 'gridCellGroup')
            .selectAll('rect')
            .data((d: any, i: number) => Object.keys(data.sets).map((set) => ({ set, intersection: d, index: i })))
            .enter()
            .append('rect')
            .attr('class', 'gridCell')
            .attr('y', (d: any) => dot_y + (data.intersections.indexOf(d.intersection) * cell_height))
            .attr('x', (d: any) => dot_x + (Object.keys(data.sets).indexOf(d.set) * cell_width))
            .attr('width', cell_width)
            .attr('height', cell_height)
            .style('fill', (d: any) => {
                const isSelected = selectedIntersections.includes(d.intersection.set);
                const isHovered = hoveredIntersection === d.intersection.set;
                return isSelected ? '#FF9806' : (isHovered ? '#FFBD62' : 'white');
            })
            .style('stroke', "black");

        // Create circles for each intersection
        svg
            .selectAll('circle.gridCell')
            .data(data.intersections)
            .enter()
            .append('g')
            .attr('class', 'gridCellGroup')
            .selectAll('circle')
            .data((d: any, i: number) => Object.keys(data.sets).map((set) => ({ set, intersection: d, index: i })))
            .enter()
            .append('circle')
            .attr('class', 'gridCell')
            .attr('cy', (d: any) => dot_y + (data.intersections.indexOf(d.intersection) * cell_height) + cell_height / 2)
            .attr('cx', (d: any) => dot_x + (Object.keys(data.sets).indexOf(d.set) * cell_width) + cell_width / 2)
            .attr('r', Math.min(cell_height, cell_width) / 3)
            .style('fill', (d: any) => {
                const isSelected = selectedIntersections.includes(d.intersection.set);
                const isHovered = hoveredIntersection === d.intersection.set;
                const isIncluded = d.intersection.set.includes(d.set);
                return isSelected ? (isIncluded ? '#FF6F00' : '#807A79')
                    : (isIncluded ? (isHovered ? '#FF9C46' : '#030202') : '#807A79');
            })
            .style('stroke', "black");

        // Plot bar chart for the sizes of intersections
        svg
            .selectAll('rect.valueBar')
            .data(data.intersections)
            .enter()
            .append('g')
            .attr('class', 'valueBarGroup')
            .selectAll('rect')
            .data((d: any, i: number) => Object.keys(data.sets).map((set) => ({ set, intersection: d, index: i })))
            .enter()
            .append('rect')
            .attr('class', 'valueBar')
            .attr('y', (d: any) => bar_y + (data.intersections.indexOf(d.intersection) * cell_height) + cell_height / 8)
            .attr('x', (d: any) => bar_x)
            .attr('width', (d: any) => normalizedValues[d.index])
            .attr('height', cell_height / 1.25) // Use normalized values
            .style('fill', (d: any) => {
                const isSelected = selectedIntersections.includes(d.intersection.set);
                const isHovered = hoveredIntersection === d.intersection.set;
                return isSelected ? '#FF6F00' : (isHovered ? '#FF9C46' : '#030202');
            });

        // Add x-axis
        const xScale = d3
            .scaleLinear()
            .domain([0, maxValue])
            .range([bar_x, bar_x + bar_width]);

        const xAxis = d3
            .axisTop(xScale)
            .ticks(3)
            .tickFormat(d3.format(".2s"));

        svg
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${bar_y})`)
            .call(xAxis);

        // Plot a single rectangle for each intersection for handling mouse events
        // Rectangle is completely transparent
        svg
            .selectAll('rect.eventRect')
            .data(data.intersections)
            .enter()
            .append('g')
            .attr('class', 'eventRectGroup')
            .selectAll('rect')
            .data((d: any, i: number) => Object.keys(data.sets).map((set) => ({ set, intersection: d, index: i })))
            .enter()
            .append('rect')
            .attr('class', 'eventRect')
            .attr('y', (d: any) => dot_y + (data.intersections.indexOf(d.intersection) * cell_height))
            .attr('x', dot_x)
            .attr('width', width)
            .attr('height', cell_height)
            .style('fill', 'transparent')
            .on('click', (event: Event, ixData: any) => onIntersectionClick(ixData))
            .on('mouseover', (event: Event, ixData: any) => {
                handleIntersectionHover(ixData);

                // Convert comma-separated numbers to their names and join with " ∩ "
                const setNames = ixData.intersection.set
                    .split(',')
                    .map((number: string) => data.sets[number])
                    .join(' ∩ ');

                d3.select(tooltipRef.current)
                    .html(`<div class="tooltip-box">
                                <div class="tooltip-title">
                                    <strong>${setNames}</strong>
                                </div>
                                <hr class="tooltip-separator">
                                <div class="tooltip-text">
                                    <p>Count: ${ixData.intersection.value}</p>
                                </div>
                            </div>`)
                    .style("opacity", .9)
                    .style("left", (event.clientX + 10) + 'px')
                    .style("top", (event.clientY + 10) + 'px');
            })
            .on('mouseleave', () => {
                handleIntersectionHover(null);
                d3.select(tooltipRef.current)
                    .html(``)
                    .style("opacity", 0);
            })
            .on('mousemove', (event: Event) => {
                d3.select(tooltipRef.current)
                    .style('left', (event.clientX + 10) + 'px')
                    .style('top', (event.clientY + 10) + 'px');
            });

    }, [data, selectedIntersections, hoveredIntersection, width, height]);

    return (
        <div>
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} id="tooltip" style={{ position: 'absolute', opacity: 0 }}></div>
        </div>
    );
};

export default UpsetPlot;
