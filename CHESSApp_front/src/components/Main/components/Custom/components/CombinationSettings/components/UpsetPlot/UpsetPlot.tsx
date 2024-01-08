import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface UpsetPlotDataProps {
    data: {
        sets: string[];
        set_names: string[];
        intersections: { set: string; value: number }[];
    };
    parentWidth: number;
    parentHeight: number;
}

const UpsetPlot: React.FC<UpsetPlotDataProps> = ({ data, parentWidth, parentHeight }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const handleRowClick = (rowData: {set:any,intersection:any,rowIndex:number}) => {
        // Toggle row selection
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(rowData.rowIndex)) {
                // Remove the row index if already selected
                return prevSelectedRows.filter((rowIndex) => rowIndex !== rowData.rowIndex);
            } else {
                // Add the row index if not selected
                return [...prevSelectedRows, rowData.rowIndex];
            }
        });
    };

    const handleRowHover = (rowData: number | null) => {
        setHoveredRow(rowData);
    };


    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);

        // Set up grid dimensions
        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        const width = parentWidth * 13;
        const height = parentHeight * 4;

        // separate into subsections
        const label_width = width * 0.1;
        const label_height = height;
        // section keeping dot plot
        const dot_width = width * 0.9;
        const dot_height = height * 0.55;
        // section separating dot plot and barplot
        const empty_width = width * 0.9;
        const empty_height = height * 0.1;
        // section keeping barplot
        const bar_width = width * 0.9;
        const bar_height = height * 0.35;

        // individual cells
        const cell_width = dot_width / data.intersections.length;
        const cell_height = dot_height / data.sets.length;

        // bars
        const maxValue = d3.max(data.intersections, (d) => d.value);
        const normalizedValues = data.intersections.map((d) => {
            return (d.value/maxValue) * bar_height;
        });
        const scaleValues = [0, maxValue / 2, maxValue];

        svg.attr('width', width).attr('height', height);

        d3.select(svgRef.current).selectAll("*").remove();

        // Create additional lines for extending columns at the top
        svg
            .selectAll('line.columnExtension')
            .data(data.sets)
            .enter()
            .append('line')
            .attr('class', 'columnExtension')
            .attr('x1', margin.left)
            .attr('x2', (d, i) => margin.left + label_width) // Adjust the length of the extension as needed
            .attr('y1', (d, i) => i * cell_height + margin.top + cell_height)
            .attr('y2', (d, i) => i * cell_height + margin.top + cell_height)
            .style('stroke', 'black')
            .style('stroke-width', '1px');

        // add text labels for each row
        svg
            .selectAll('text.columnLabel')
            .data(data.set_names)
            .enter()
            .append('text')
            .attr('class', 'columnLabel')
            .attr('x', margin.left) // Adjust the x position as needed
            .attr('y', (d, i) => i * cell_height + margin.top + cell_height / 2)
            .attr('dy', '0.35em') // Adjust vertical alignment if needed
            .text((d) => d); // Use the data point as the label

        // Draw a bounding rectangle
        svg
            .append('rect')
            .attr('x', margin.left+label_width)
            .attr('y', margin.top)
            .attr('width', width - margin.left - margin.right - label_width)
            .attr('height', dot_height - margin.top - margin.bottom)
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .style('fill', 'none');

        // Create rectangles for each intersection(behind circles)
        svg
            .selectAll('rect.gridCell')
            .data(data.intersections)
            .enter()
            .append('g')
            .attr('class', 'gridCellGroup')
            .selectAll('rect')
            .data((d:any, i:number) => data.sets.map((set) => ({ set, intersection: d, rowIndex: i })))
            .enter()
            .append('rect')
            .attr('class', 'gridCell')
            .attr('y', (d:any) => data.sets.indexOf(d.set) * cell_height + margin.left)
            .attr('x', (d:any) => data.intersections.indexOf(d.intersection) * cell_width + margin.top + label_width)
            .attr('width', cell_width)
            .attr('height', cell_height)
            .style('fill', (d:any) => {
                const isSelected = selectedRows.includes(d.rowIndex);
                const isHovered = hoveredRow === d.rowIndex;
                return isSelected ? '#FF9806' : (isHovered ? '#FFBD62' : 'white');
            })
            .style('stroke', "black")

        // Create circles for each intersection
        svg
            .selectAll('circle.gridCell')
            .data(data.intersections)
            .enter()
            .append('g')
            .attr('class', 'gridCellGroup')
            .selectAll('circle')
            .data((d:any, i:number) => data.sets.map((set) => ({ set, intersection: d, rowIndex: i })))
            .enter()
            .append('circle')
            .attr('class', 'gridCell')
            .attr('cy', (d:any) => data.sets.indexOf(d.set) * cell_height + margin.left + cell_height / 2)
            .attr('cx', (d:any) => data.intersections.indexOf(d.intersection) * cell_width + margin.top + label_width + cell_width / 2)
            .attr('r', Math.min(cell_height,cell_width) / 3)
            .style('fill', (d:any) => {
                const isSelected = selectedRows.includes(d.rowIndex);
                const isHovered = hoveredRow === d.rowIndex;
                const isIncluded = d.intersection.set.includes(d.set);
                return isSelected ? (isIncluded ? '#FF6F00' : '#807A79') 
                                  : (isIncluded ? ( isHovered ? '#FF9C46' : '#030202') : '#807A79');
            })
            .style('stroke', "black");

        // plot bar chart for the sizes of intersections
        svg
            .selectAll('rect.valueBar')
            .data(data.intersections)
            .enter()
            .append('g')
            .attr('class', 'valueBarGroup')
            .selectAll('rect')
            .data((d:any, i:number) => data.sets.map((set) => ({ set, intersection: d, rowIndex: i })))
            .enter()
            .append('rect')
            .attr('class', 'valueBar')
            .attr('y', (d:any) => data.sets.length * cell_height + margin.left + empty_height)
            .attr('x', (d:any) => data.intersections.indexOf(d.intersection) * cell_width + margin.top + label_width + cell_width / 8)
            .attr('width', cell_width / 1.25)
            .attr('height', (d:any) => normalizedValues[d.rowIndex]) // Use normalized values
            .style('fill', (d:any) => {
                const isSelected = selectedRows.includes(d.rowIndex);
                const isHovered = hoveredRow === d.rowIndex;
                return isSelected ? '#FF6F00' : (isHovered ? '#FF9C46' : '#030202');
            });

        // Add vertical axis to the right of the bar section
        const axisScale = d3.scaleLinear()
            .domain([maxValue,0])
            .range([height, height - bar_height]);

        const axis = d3.axisLeft(axisScale)
            .ticks(3)
            .tickFormat(d3.format(".2s"));

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(${margin.left + label_width}, ${margin.top})`)
            .call(axis);
        
    // plot a single rectangle for each intersection for handling mouse events
    // rectangle is completely transparent
    svg
        .selectAll('rect.eventRect')
        .data(data.intersections)
        .enter()
        .append('g')
        .attr('class', 'eventRectGroup')
        .selectAll('rect')
        .data((d:any, i:number) => data.sets.map((set) => ({ set, intersection: d, rowIndex: i })))
        .enter()
        .append('rect')
        .attr('class', 'eventRect')
        .attr('y', margin.top)
        .attr('x', (d:any) => data.intersections.indexOf(d.intersection) * cell_width + margin.top + label_width)
        .attr('width', cell_width)
        .attr('height', height)
        .style('fill', 'transparent')
        .on('click', (event:Event, rowData:any) => handleRowClick(rowData))
        .on('mouseover', (event: Event, rowData: any) => {
            handleRowHover(rowData.rowIndex);
        })
        .on('mouseleave', () => {
            handleRowHover(null);
        });
    }, [data, selectedRows, hoveredRow, parentWidth, parentHeight]);

    return (
        <svg ref={svgRef}>
        </svg>
    );
};

export default UpsetPlot;
