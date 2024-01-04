import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

interface UpsetPlotDataProps {
    data: {
        sets: string[];
        intersections: { set: string; value: number }[];
    };
}

const Grid: React.FC<UpsetPlotDataProps> = ({ data }) => {
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
        const cellSize = 30;
        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        const label_width = 50;
        const width = data.intersections.length * cellSize + margin.left + margin.right + label_width;
        const height = data.sets.length * cellSize + margin.top + margin.bottom;

        // bars
        const barHeight = 50;
        const maxValue = d3.max(data.intersections, (d) => d.value);
        const normalizedValues = data.intersections.map((d) => {
            return (d.value/maxValue) * barHeight;
        });
        const scaleValues = [0, maxValue / 2, maxValue];
        const reversedScaleValues = scaleValues.slice().reverse();

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
            .attr('y1', (d, i) => i * cellSize + margin.top + cellSize)
            .attr('y2', (d, i) => i * cellSize + margin.top + cellSize)
            .style('stroke', 'black')
            .style('stroke-width', '1px');

        svg
            .selectAll('text.columnLabel')
            .data(data.sets)
            .enter()
            .append('text')
            .attr('class', 'columnLabel')
            .attr('x', margin.left) // Adjust the x position as needed
            .attr('y', (d, i) => i * cellSize + margin.top + cellSize / 2)
            .attr('dy', '0.35em') // Adjust vertical alignment if needed
            .text((d) => d); // Use the data point as the label

        // Draw a bounding rectangle
        svg
            .append('rect')
            .attr('x', margin.left+label_width)
            .attr('y', margin.top)
            .attr('width', width - margin.left - margin.right - label_width)
            .attr('height', height - margin.top - margin.bottom)
            .style('stroke', 'black')
            .style('stroke-width', '1px')
            .style('fill', 'none');

        // Create grid lines
        svg
            .selectAll('line.verticalGrid')
            .data(data.intersections)
            .enter()
            .append('line')
            .attr('class', 'verticalGrid')
            .attr('x1', (d:any, i:number) => i * cellSize + margin.left + label_width) // Starting vertical grid line
            .attr('x2', (d:any, i:number) => i * cellSize + margin.left + label_width) // Ending vertical grid line
            .attr('y1', margin.top)
            .attr('y2', height - margin.bottom)
            .style('stroke', 'black')
            .style('stroke-width', '1px');

        svg
            .selectAll('line.horizontalGrid')
            .data(data.sets)
            .enter()
            .append('line')
            .attr('class', 'horizontalGrid')
            .attr('x1', margin.left + label_width)
            .attr('x2', width - margin.right)
            .attr('y1', (d:any, i:number) => i * cellSize + margin.top) // Adjusted y1 to (i + 1) * cellSize
            .attr('y2', (d:any, i:number) => i * cellSize + margin.top) // Adjusted y2 to (i + 1) * cellSize
            .style('stroke', 'black')
            .style('stroke-width', '1px');

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
            .attr('y', (d:any) => data.sets.indexOf(d.set) * cellSize + margin.left)
            .attr('x', (d:any) => data.intersections.indexOf(d.intersection) * cellSize + margin.top + label_width)
            .attr('width', cellSize)
            .attr('height', cellSize)
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
            .attr('cy', (d:any) => data.sets.indexOf(d.set) * cellSize + margin.left + cellSize / 2)
            .attr('cx', (d:any) => data.intersections.indexOf(d.intersection) * cellSize + margin.top + label_width + cellSize / 2)
            .attr('r', cellSize / 3)
            .style('fill', (d:any) => {
                const isSelected = selectedRows.includes(d.rowIndex);
                const isHovered = hoveredRow === d.rowIndex;
                const isIncluded = d.intersection.set.includes(d.set);
                return isSelected ? (isIncluded ? '#FF6F00' : '#807A79') 
                                  : (isIncluded ? ( isHovered ? '#FF9C46' : '#030202') : '#807A79');
            })
            .style('stroke', "black");

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
            .attr('x', (d:any) => data.intersections.indexOf(d.intersection) * cellSize + margin.top + label_width)
            .attr('width', cellSize)
            .attr('height', cellSize*data.sets.length+barHeight+10+2)
            .style('fill', 'transparent')
            .on('click', (event:Event, rowData:any) => handleRowClick(rowData))
            .on('mouseover', (event: Event, rowData: any) => {
                handleRowHover(rowData.rowIndex);
            })
            .on('mouseleave', () => {
                handleRowHover(null);
            });

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
            .attr('y', (d:any) => data.sets.length * cellSize + margin.left + 10)
            .attr('x', (d:any) => data.intersections.indexOf(d.intersection) * cellSize + margin.top + label_width + cellSize / 8)
            .attr('width', cellSize / 1.25)
            .attr('height', (d:any) => normalizedValues[d.rowIndex]) // Use normalized values
            .style('fill', (d:any) => {
                const isSelected = selectedRows.includes(d.rowIndex);
                const isHovered = hoveredRow === d.rowIndex;
                return isSelected ? '#FF6F00' : (isHovered ? '#FF9C46' : '#030202');
            });

        // Add vertical axis to the right of the bar section
        const axisScale = d3.scaleLinear()
            .domain([maxValue,0])
            .range([(data.sets.length * cellSize) + barHeight, (data.sets.length * cellSize)]);

        const axis = d3.axisLeft(axisScale)
            .ticks(3)
            .tickFormat(d3.format(".2s"));

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(${margin.left + label_width}, ${margin.top+10})`)
            .call(axis);
    }, [data, selectedRows, hoveredRow]);

    return (
        <svg ref={svgRef} width="100%" height="100%">
        </svg>
    );
};

export default Grid;
