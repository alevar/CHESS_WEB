import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import './ExpressionBoxplot.css';

interface BoxplotData {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  std: number;
  count: number;
}

interface ExpressionBoxplotProps {
  data: string; // The raw expression data string
  width?: number;
  height?: number;
  sortBy?: 'median' | 'group' | 'mean' | 'count';
  sortOrder?: 'asc' | 'desc';
  onSortByChange?: (sortBy: 'median' | 'group' | 'mean' | 'count') => void;
  onSortOrderChange?: (sortOrder: 'asc' | 'desc') => void;
}

const ExpressionBoxplot: React.FC<ExpressionBoxplotProps> = ({
  data,
  width = 800,
  height = 400,
  sortBy = 'median',
  sortOrder = 'desc',
  onSortByChange,
  onSortOrderChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<BoxplotData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Parse the expression data string
  const parsedData = useMemo(() => {
    if (!data) return [];
    
    const groups = data.split(';').filter(group => group.trim());
    const parsed: BoxplotData[] = [];
    
    groups.forEach(group => {
      const [groupName, ...stats] = group.split(':');
      if (stats.length === 0) return;
      
      const statsStr = stats.join(':');
      const statPairs = statsStr.split(',').filter(pair => pair.trim());
      
      const boxplotData: BoxplotData = {
        group: groupName,
        min: 0,
        q1: 0,
        median: 0,
        q3: 0,
        max: 0,
        mean: 0,
        std: 0,
        count: 0
      };
      
      statPairs.forEach(pair => {
        const [key, value] = pair.split(':');
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          switch (key) {
            case '25':
              boxplotData.q1 = numValue;
              break;
            case '50':
              boxplotData.median = numValue;
              break;
            case '75':
              boxplotData.q3 = numValue;
              break;
            case 'min':
              boxplotData.min = numValue;
              break;
            case 'max':
              boxplotData.max = numValue;
              break;
            case 'mean':
              boxplotData.mean = numValue;
              break;
            case 'std':
              boxplotData.std = numValue;
              break;
            case 'count':
              boxplotData.count = numValue;
              break;
          }
        }
      });
      
      parsed.push(boxplotData);
    });
    
    return parsed;
  }, [data]);

  // Sort data based on sortBy and sortOrder
  const sortedData = useMemo(() => {
    if (!parsedData.length) return [];
    
    const sorted = [...parsedData].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'median':
          comparison = a.median - b.median;
          break;
        case 'mean':
          comparison = a.mean - b.mean;
          break;
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'group':
          comparison = a.group.localeCompare(b.group);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [parsedData, sortBy, sortOrder]);

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || !sortedData.length) {
      return;
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Responsive width adjustment
    const containerWidth = svgRef.current.parentElement?.clientWidth || width;
    const responsiveWidth = Math.max(600, Math.min(width, containerWidth - 40)); // Ensure minimum width for readability
    
    // Calculate margins based on data length to prevent labels from going off screen
    const labelCount = sortedData.length;
    const minLabelWidth = 80; // Minimum width needed per label for readability
    const requiredWidth = labelCount * minLabelWidth;
    
    // Adjust margins based on data and available space
    const margin = { 
      top: 20, 
      right: 40, 
      bottom: Math.max(100, requiredWidth > responsiveWidth * 0.7 ? 140 : 100), 
      left: 80 
    };
    
    const chartWidth = responsiveWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(sortedData.map(d => d.group))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([
        (d3.min(sortedData, d => d.min) || 0) * 0.9,
        (d3.max(sortedData, d => d.max) || 100) * 1.1
      ])
      .range([chartHeight, 0]);

    // X-axis with rotated labels
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '11px')
      .style('fill', '#333');

    // Y-axis
    g.append('g')
      .call(d3.axisLeft(yScale));

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Expression Value');

    // Boxplots
    sortedData.forEach((d, i) => {
      const x = xScale(d.group);
      if (x === undefined) return;
      
      const boxWidth = xScale.bandwidth() * 0.8;
      const centerX = x + xScale.bandwidth() / 2;
      
      // Whiskers
      g.append('line')
        .attr('x1', centerX)
        .attr('x2', centerX)
        .attr('y1', yScale(d.min))
        .attr('y2', yScale(d.max))
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .on('mouseover', (event) => {
          setTooltipData(d);
          setTooltipPosition({ x: event.clientX, y: event.clientY });
        })
        .on('mouseout', () => {
          setTooltipData(null);
        });

      // Box
      g.append('rect')
        .attr('x', centerX - boxWidth / 2)
        .attr('y', yScale(d.q3))
        .attr('width', boxWidth)
        .attr('height', yScale(d.q1) - yScale(d.q3))
        .attr('fill', '#69b3a2')
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .on('mouseover', (event) => {
          setTooltipData(d);
          setTooltipPosition({ x: event.clientX, y: event.clientY });
        })
        .on('mouseout', () => {
          setTooltipData(null);
        });

      // Median line
      g.append('line')
        .attr('x1', centerX - boxWidth / 2)
        .attr('x2', centerX + boxWidth / 2)
        .attr('y1', yScale(d.median))
        .attr('y2', yScale(d.median))
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .on('mouseover', (event) => {
          setTooltipData(d);
          setTooltipPosition({ x: event.clientX, y: event.clientY });
        })
        .on('mouseout', () => {
          setTooltipData(null);
        });
    });
    
  }, [sortedData, width, height]);

  if (!data || !parsedData.length) {
    return (
      <div className="expression-boxplot-empty">
        <p className="text-muted">No expression data available</p>
      </div>
    );
  }

  return (
    <div className="expression-boxplot-container">
      <div className="expression-boxplot-controls mb-3">
        <div className="d-flex align-items-center gap-3">
          <label className="form-label mb-0">Sort by:</label>
          <select 
            className="form-select form-select-sm"
            value={sortBy}
            onChange={(e) => {
              const newSortBy = e.target.value as 'median' | 'group' | 'mean' | 'count';
              onSortByChange?.(newSortBy);
            }}
          >
            <option value="median">Median</option>
            <option value="mean">Mean</option>
            <option value="count">Count</option>
            <option value="group">Group Name</option>
          </select>
          
          <label className="form-label mb-0">Order:</label>
          <select 
            className="form-select form-select-sm"
            value={sortOrder}
            onChange={(e) => {
              const newSortOrder = e.target.value as 'asc' | 'desc';
              onSortOrderChange?.(newSortOrder);
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="expression-boxplot-svg"
        style={{ maxWidth: width }}
      />
      
      {/* Tooltip */}
      {tooltipData && (
        <div 
          className="expression-boxplot-tooltip"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10
          }}
        >
          <div className="tooltip-header">
            <strong>{tooltipData.group}</strong>
          </div>
          <div className="tooltip-content">
            <div>Count: {tooltipData.count}</div>
            <div>Min: {tooltipData.min.toFixed(2)}</div>
            <div>Q1: {tooltipData.q1.toFixed(2)}</div>
            <div>Median: {tooltipData.median.toFixed(2)}</div>
            <div>Q3: {tooltipData.q3.toFixed(2)}</div>
            <div>Max: {tooltipData.max.toFixed(2)}</div>
            <div>Mean: {tooltipData.mean.toFixed(2)}</div>
            <div>Std: {tooltipData.std.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpressionBoxplot; 