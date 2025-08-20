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
  source?: 'primary' | 'secondary';
}

interface ExpressionBoxplotProps {
  data: string; // The raw expression data string for primary transcript
  secondaryData?: string; // The raw expression data string for secondary transcript
  width?: number;
  height?: number;
  sortBy?: 'median' | 'group' | 'mean' | 'count';
  sortOrder?: 'asc' | 'desc';
  sortByTranscript?: 'primary' | 'secondary'; // New prop for transcript selection
  onSortByChange?: (sortBy: 'median' | 'group' | 'mean' | 'count') => void;
  onSortOrderChange?: (sortOrder: 'asc' | 'desc') => void;
  onSortByTranscriptChange?: (sortByTranscript: 'primary' | 'secondary') => void; // New callback
  primaryColor?: string;
  secondaryColor?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  comparisonMode?: boolean;
}

const ExpressionBoxplot: React.FC<ExpressionBoxplotProps> = ({
  data,
  secondaryData,
  width = 800,
  height = 400,
  sortBy = 'median',
  sortOrder = 'desc',
  sortByTranscript = 'primary',
  onSortByChange,
  onSortOrderChange,
  onSortByTranscriptChange,
  primaryColor = '#FF6B35',
  secondaryColor = '#9C27B0',
  primaryLabel = 'Primary',
  secondaryLabel = 'Secondary',
  comparisonMode = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipData, setTooltipData] = useState<{data: BoxplotData, source: string} | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Parse expression data string into BoxplotData
  const parseExpressionData = (dataString: string, source: 'primary' | 'secondary'): BoxplotData[] => {
    if (!dataString) return [];
    
    const groups = dataString.split(';').filter(group => group.trim());
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
        count: 0,
        source
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
  };

  // Parse both primary and secondary data
  const parsedPrimaryData = useMemo(() => parseExpressionData(data, 'primary'), [data]);
  const parsedSecondaryData = useMemo(() => parseExpressionData(secondaryData || '', 'secondary'), [secondaryData]);

  // Merge and normalize data for comparison mode
  const mergedData = useMemo(() => {
    if (!comparisonMode || !secondaryData) {
      return parsedPrimaryData;
    }

    // Get all unique groups from both datasets
    const allGroups = new Set([
      ...parsedPrimaryData.map(d => d.group),
      ...parsedSecondaryData.map(d => d.group)
    ]);

    const merged: BoxplotData[] = [];

    // Create entries for all groups, with both primary and secondary data
    allGroups.forEach(group => {
      const primaryEntry = parsedPrimaryData.find(d => d.group === group);
      const secondaryEntry = parsedSecondaryData.find(d => d.group === group);

      // Add primary data if it exists
      if (primaryEntry) {
        merged.push({
          ...primaryEntry,
          source: 'primary'
        });
      }

      // Add secondary data if it exists
      if (secondaryEntry) {
        merged.push({
          ...secondaryEntry,
          source: 'secondary'
        });
      }
    });

    return merged;
  }, [parsedPrimaryData, parsedSecondaryData, comparisonMode, secondaryData]);

  // Group data by original group name for sorting
  const groupedData = useMemo(() => {
    const groups = new Map<string, BoxplotData[]>();
    
    mergedData.forEach(item => {
      const groupName = item.group;
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(item);
    });
    
    return groups;
  }, [mergedData]);

  // Sort groups based on sortBy and sortOrder
  const sortedGroups = useMemo(() => {
    const groupEntries = Array.from(groupedData.entries());
    
    const sorted = groupEntries.sort(([groupNameA, dataA], [groupNameB, dataB]) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'median':
          if (comparisonMode) {
            // In comparison mode, sort based on transcript selection
            let medianA: number, medianB: number;
            
            if (sortByTranscript === 'primary') {
              medianA = dataA.find(d => d.source === 'primary')?.median || 0;
              medianB = dataB.find(d => d.source === 'primary')?.median || 0;
            } else {
              medianA = dataA.find(d => d.source === 'secondary')?.median || 0;
              medianB = dataB.find(d => d.source === 'secondary')?.median || 0;
            }
            comparison = medianA - medianB;
          } else {
            // Single transcript mode - use the median value
            const medianA = dataA[0]?.median || 0;
            const medianB = dataB[0]?.median || 0;
            comparison = medianA - medianB;
          }
          break;
        case 'mean':
          if (comparisonMode) {
            // In comparison mode, sort based on transcript selection
            let meanA: number, meanB: number;
            
            if (sortByTranscript === 'primary') {
              meanA = dataA.find(d => d.source === 'primary')?.mean || 0;
              meanB = dataB.find(d => d.source === 'primary')?.mean || 0;
            } else {
              meanA = dataA.find(d => d.source === 'secondary')?.mean || 0;
              meanB = dataB.find(d => d.source === 'secondary')?.mean || 0;
            }
            comparison = meanA - meanB;
          } else {
            // Single transcript mode - use the mean value
            const meanA = dataA[0]?.mean || 0;
            const meanB = dataB[0]?.mean || 0;
            comparison = meanA - meanB;
          }
          break;
        case 'count':
          if (comparisonMode) {
            // In comparison mode, sort based on transcript selection
            let countA: number, countB: number;
            
            if (sortByTranscript === 'primary') {
              countA = dataA.find(d => d.source === 'primary')?.count || 0;
              countB = dataB.find(d => d.source === 'primary')?.count || 0;
            } else {
              countA = dataA.find(d => d.source === 'secondary')?.count || 0;
              countB = dataB.find(d => d.source === 'secondary')?.count || 0;
            }
            comparison = countA - countB;
          } else {
            // Single transcript mode - use the count value
            const countA = dataA[0]?.count || 0;
            const countB = dataB[0]?.count || 0;
            comparison = countA - countB;
          }
          break;
        case 'group':
          comparison = groupNameA.localeCompare(groupNameB);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [groupedData, sortBy, sortOrder, comparisonMode, sortByTranscript]);

  // Flatten sorted groups back to array for rendering
  const sortedData = useMemo(() => {
    const flattened: BoxplotData[] = [];
    sortedGroups.forEach(([groupName, groupData]) => {
      // Sort within group: primary first, then secondary
      const sortedGroupData = groupData.sort((a, b) => {
        if (a.source === 'primary' && b.source === 'secondary') return -1;
        if (a.source === 'secondary' && b.source === 'primary') return 1;
        return 0;
      });
      flattened.push(...sortedGroupData);
    });
    return flattened;
  }, [sortedGroups]);

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
    const responsiveWidth = Math.max(600, Math.min(width, containerWidth - 40));
    
    // Calculate margins based on data length to prevent labels from going off screen
    const labelCount = sortedGroups.length;
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

    // Create scales
    const groupScale = d3.scaleBand()
      .domain(sortedGroups.map(([groupName]) => groupName))
      .range([0, chartWidth])
      .padding(0.2);

    const subgroupScale = d3.scaleBand()
      .domain(['primary', 'secondary'])
      .range([0, groupScale.bandwidth()])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([
        (d3.min(sortedData, d => d.min) || 0) * 0.9,
        (d3.max(sortedData, d => d.max) || 100) * 1.1
      ])
      .range([chartHeight, 0]);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(groupScale))
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

    // Render boxplots
    sortedGroups.forEach(([groupName, groupData]) => {
      const groupX = groupScale(groupName);
      if (groupX === undefined) return;

      groupData.forEach((d) => {
        const subgroupX = comparisonMode ? subgroupScale(d.source!) : 0;
        const boxWidth = comparisonMode ? subgroupScale.bandwidth() * 0.8 : groupScale.bandwidth() * 0.8;
        const centerX = groupX + (comparisonMode ? subgroupX! + subgroupScale.bandwidth() / 2 : groupScale.bandwidth() / 2);
        const color = d.source === 'primary' ? primaryColor : secondaryColor;
        
        // Whiskers (min-max lines)
        g.append('line')
          .attr('x1', centerX)
          .attr('x2', centerX)
          .attr('y1', yScale(d.min))
          .attr('y2', yScale(d.max))
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            setTooltipData({data: d, source: d.source === 'primary' ? primaryLabel : secondaryLabel});
            setTooltipPosition({ x: event.clientX, y: event.clientY });
          })
          .on('mouseout', () => {
            setTooltipData(null);
          });

        // Whisker caps (min and max horizontal lines)
        g.append('line')
          .attr('x1', centerX - boxWidth / 4)
          .attr('x2', centerX + boxWidth / 4)
          .attr('y1', yScale(d.min))
          .attr('y2', yScale(d.min))
          .attr('stroke', color)
          .attr('stroke-width', 2);

        g.append('line')
          .attr('x1', centerX - boxWidth / 4)
          .attr('x2', centerX + boxWidth / 4)
          .attr('y1', yScale(d.max))
          .attr('y2', yScale(d.max))
          .attr('stroke', color)
          .attr('stroke-width', 2);

        // Box (Q1 to Q3)
        g.append('rect')
          .attr('x', centerX - boxWidth / 2)
          .attr('y', yScale(d.q3))
          .attr('width', boxWidth)
          .attr('height', yScale(d.q1) - yScale(d.q3))
          .attr('fill', color)
          .attr('fill-opacity', 0.7)
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            setTooltipData({data: d, source: d.source === 'primary' ? primaryLabel : secondaryLabel});
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
          .attr('stroke-width', 3)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            setTooltipData({data: d, source: d.source === 'primary' ? primaryLabel : secondaryLabel});
            setTooltipPosition({ x: event.clientX, y: event.clientY });
          })
          .on('mouseout', () => {
            setTooltipData(null);
          });

        // Mean point (circle)
        g.append('circle')
          .attr('cx', centerX)
          .attr('cy', yScale(d.mean))
          .attr('r', 3)
          .attr('fill', 'white')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            setTooltipData({data: d, source: d.source === 'primary' ? primaryLabel : secondaryLabel});
            setTooltipPosition({ x: event.clientX, y: event.clientY });
          })
          .on('mouseout', () => {
            setTooltipData(null);
          });
      });
    });
    
  }, [sortedData, sortedGroups, width, height, primaryColor, secondaryColor, comparisonMode, secondaryData, primaryLabel, secondaryLabel, sortBy, sortOrder, sortByTranscript]);

  if (!data || !parsedPrimaryData.length) {
    return (
      <div className="expression-boxplot-empty">
        <p className="text-muted">No expression data available</p>
      </div>
    );
  }

  return (
    <div className="expression-boxplot-container">
      <div className="expression-boxplot-controls mb-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <label className="form-label mb-0">Sort by:</label>
          <select 
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
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
          
          {comparisonMode && sortBy !== 'group' && (
            <>
              <label className="form-label mb-0">Sort by transcript:</label>
              <select 
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={sortByTranscript}
                onChange={(e) => {
                  const newSortByTranscript = e.target.value as 'primary' | 'secondary';
                  onSortByTranscriptChange?.(newSortByTranscript);
                }}
              >
                <option value="primary">{primaryLabel}</option>
                <option value="secondary">{secondaryLabel}</option>
              </select>
            </>
          )}
          
          <label className="form-label mb-0">Order:</label>
          <select 
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
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
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '250px'
          }}
        >
          <div className="tooltip-header" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            <span style={{ 
              color: tooltipData.data.source === 'primary' ? primaryColor : secondaryColor 
            }}>
              {tooltipData.source}:
            </span> {tooltipData.data.group}
          </div>
          <div className="tooltip-content">
            <div>Count: {tooltipData.data.count}</div>
            <div>Min: {tooltipData.data.min.toFixed(2)}</div>
            <div>Q1: {tooltipData.data.q1.toFixed(2)}</div>
            <div>Median: {tooltipData.data.median.toFixed(2)}</div>
            <div>Q3: {tooltipData.data.q3.toFixed(2)}</div>
            <div>Max: {tooltipData.data.max.toFixed(2)}</div>
            <div>Mean: {tooltipData.data.mean.toFixed(2)}</div>
            <div>Std: {tooltipData.data.std.toFixed(2)}</div>
            {comparisonMode && (
              <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.8 }}>
                {tooltipData.data.count === 0 ? 'No data available for this group' : (
                  <div>
                    <div>Side-by-side comparison</div>
                    {sortBy !== 'group' && (
                      <div style={{ marginTop: '2px' }}>
                        Sorting by {sortBy} from {sortByTranscript} ({sortOrder === 'desc' ? 'highest' : 'lowest'} first)
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpressionBoxplot;