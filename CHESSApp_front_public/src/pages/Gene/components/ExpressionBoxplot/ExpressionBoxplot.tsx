import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Form, Row, Col } from 'react-bootstrap';
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
  data: string;
  secondaryData?: string;
  width?: number;
  height?: number;
  sortBy?: 'median' | 'group' | 'mean' | 'count';
  sortOrder?: 'asc' | 'desc';
  sortByTranscript?: 'primary' | 'secondary';
  onSortByChange?: (sortBy: 'median' | 'group' | 'mean' | 'count') => void;
  onSortOrderChange?: (sortOrder: 'asc' | 'desc') => void;
  onSortByTranscriptChange?: (sortByTranscript: 'primary' | 'secondary') => void;
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
    
    return dataString.split(';')
      .filter(group => group.trim())
      .map(group => {
        const [groupName, ...stats] = group.split(':');
        const statsStr = stats.join(':');
        const statPairs = statsStr.split(',').filter(pair => pair.trim());
        
        const boxplotData: BoxplotData = {
          group: groupName,
          min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, std: 0, count: 0,
          source
        };
        
        const statMap: Record<string, keyof BoxplotData> = {
          '25': 'q1', '50': 'median', '75': 'q3',
          'min': 'min', 'max': 'max', 'mean': 'mean', 'std': 'std', 'count': 'count'
        };
        
        statPairs.forEach(pair => {
          const [key, value] = pair.split(':');
          const field = statMap[key];
          if (field) {
            (boxplotData as any)[field] = parseFloat(value) || 0;
          }
        });
        
        return boxplotData;
      });
  };

  // Parse and merge data
  const allData = useMemo(() => {
    const primaryData = parseExpressionData(data, 'primary');
    const parsedSecondaryData = parseExpressionData(secondaryData || '', 'secondary');
    
    if (!comparisonMode || !parsedSecondaryData.length) {
      return primaryData;
    }

    // Create merged dataset with both primary and secondary for each group
    const allGroups = new Set([...primaryData.map(d => d.group), ...parsedSecondaryData.map(d => d.group)]);
    const merged: BoxplotData[] = [];
    
    allGroups.forEach(group => {
      const primary = primaryData.find(d => d.group === group);
      const secondary = parsedSecondaryData.find(d => d.group === group);
      
      if (primary) merged.push(primary);
      if (secondary) merged.push(secondary);
    });
    
    return merged;
  }, [data, secondaryData, comparisonMode]);

  // Sort data
  const sortedData = useMemo(() => {
    const grouped = new Map<string, BoxplotData[]>();
    allData.forEach(item => {
      if (!grouped.has(item.group)) grouped.set(item.group, []);
      grouped.get(item.group)!.push(item);
    });

    const getSortValue = (groupData: BoxplotData[], sortBy: string): number => {
      if (sortBy === 'group') return 0; // Will be handled by string comparison
      
      const transcript = comparisonMode ? sortByTranscript : 'primary';
      const item = groupData.find(d => d.source === transcript) || groupData[0];
      return item?.[sortBy as keyof BoxplotData] as number || 0;
    };

    const sortedGroups = Array.from(grouped.entries()).sort(([nameA, dataA], [nameB, dataB]) => {
      let comparison: number;
      
      if (sortBy === 'group') {
        comparison = nameA.localeCompare(nameB);
      } else {
        comparison = getSortValue(dataA, sortBy) - getSortValue(dataB, sortBy);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Flatten with primary first within each group
    return sortedGroups.flatMap(([_, groupData]) => 
      groupData.sort((a, b) => a.source === 'primary' ? -1 : b.source === 'primary' ? 1 : 0)
    );
  }, [allData, sortBy, sortOrder, sortByTranscript, comparisonMode]);

  // Create tooltip handlers
  const handleMouseOver = (event: MouseEvent, d: BoxplotData) => {
    setTooltipData({
      data: d, 
      source: d.source === 'primary' ? primaryLabel : secondaryLabel
    });
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseOut = () => setTooltipData(null);

  // Render boxplot elements
  const renderBoxplot = (g: d3.Selection<SVGGElement, unknown, null, undefined>, 
                        d: BoxplotData, centerX: number, boxWidth: number, 
                        yScale: d3.ScaleLinear<number, number, never>) => {
    const color = d.source === 'primary' ? primaryColor : secondaryColor;
    
    // Whiskers and caps
    [
      { x1: centerX, x2: centerX, y1: yScale(d.min), y2: yScale(d.max) }, // Main whisker
      { x1: centerX - boxWidth/4, x2: centerX + boxWidth/4, y1: yScale(d.min), y2: yScale(d.min) }, // Min cap
      { x1: centerX - boxWidth/4, x2: centerX + boxWidth/4, y1: yScale(d.max), y2: yScale(d.max) }  // Max cap
    ].forEach(line => {
      g.append('line')
        .attr('x1', line.x1).attr('x2', line.x2)
        .attr('y1', line.y1).attr('y2', line.y2)
        .attr('stroke', color).attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', (event) => handleMouseOver(event, d))
        .on('mouseout', handleMouseOut);
    });

    // Box
    g.append('rect')
      .attr('x', centerX - boxWidth/2)
      .attr('y', yScale(d.q3))
      .attr('width', boxWidth)
      .attr('height', yScale(d.q1) - yScale(d.q3))
      .attr('fill', color).attr('fill-opacity', 0.5)
      .attr('stroke', color).attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event) => handleMouseOver(event, d))
      .on('mouseout', handleMouseOut);

    // Median line
    g.append('line')
      .attr('x1', centerX - boxWidth/2).attr('x2', centerX + boxWidth/2)
      .attr('y1', yScale(d.median)).attr('y2', yScale(d.median))
      .attr('stroke', '#333').attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event) => handleMouseOver(event, d))
      .on('mouseout', handleMouseOut);
  };

  // D3 chart rendering
  useEffect(() => {
    if (!svgRef.current || !sortedData.length) return;

    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);
    
    const width = svgRef.current.clientWidth;
    const uniqueGroups = [...new Set(sortedData.map(d => d.group))];
    
    const margin = { 
      top: 20, right: 40, left: 100,
      bottom: 100
    };
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    svg.attr('width', width).attr('height', height);
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const groupScale = d3.scaleBand()
      .domain(uniqueGroups)
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

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(groupScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em').attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '11px').style('fill', '#333');

    g.append('g').call(d3.axisLeft(yScale));

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px');

    // Render boxplots
    sortedData.forEach(d => {
      const groupX = groupScale(d.group)!;
      const subgroupX = comparisonMode ? subgroupScale(d.source!)! : 0;
      const boxWidth = comparisonMode ? subgroupScale.bandwidth() * 0.8 : groupScale.bandwidth() * 0.8;
      const centerX = groupX + (comparisonMode ? subgroupX + subgroupScale.bandwidth() / 2 : groupScale.bandwidth() / 2);
      
      renderBoxplot(g, d, centerX, boxWidth, yScale);
    });
    
  }, [sortedData, width, height, primaryColor, secondaryColor, comparisonMode, primaryLabel, secondaryLabel]);

  if (!data || !allData.length) {
    return (
      <div className="expression-boxplot-empty">
        <p className="text-muted">No expression data available</p>
      </div>
    );
  }

  return (
    <div className="expression-boxplot-container">
      <Row className="mb-3 g-2 align-items-center">
        <Col xs="auto">
          <Form.Label className="mb-0">Sort by:</Form.Label>
          <Form.Select 
            size="sm"
            value={sortBy}
            onChange={(e) => onSortByChange?.(e.target.value as typeof sortBy)}
          >
            <option value="median">Median</option>
            <option value="mean">Mean</option>
            <option value="count">Count</option>
            <option value="group">Group Name</option>
          </Form.Select>
        </Col>
          
          {comparisonMode && sortBy !== 'group' && (
            <Col xs="auto">
              <Form.Label className="mb-0">Sort by transcript:</Form.Label>
              <Form.Select 
                size="sm"
                value={sortByTranscript}
                onChange={(e) => onSortByTranscriptChange?.(e.target.value as typeof sortByTranscript)}
              >
                <option value="primary">{primaryLabel}</option>
                <option value="secondary">{secondaryLabel}</option>
              </Form.Select>
            </Col>
          )}
        
        <Col xs="auto">
          <Form.Label className="mb-0">Order:</Form.Label>
          <Form.Select 
            size="sm"
            value={sortOrder}
            onChange={(e) => onSortOrderChange?.(e.target.value as typeof sortOrder)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Form.Select>
        </Col>
      </Row>
      
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="expression-boxplot-svg"
      />
      
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
            {['Count', 'Min', 'Q1', 'Median', 'Q3', 'Max', 'Mean', 'Std'].map(stat => (
              <div key={stat}>
                {stat}: {(tooltipData.data[stat.toLowerCase() as keyof BoxplotData] as number).toFixed(stat === 'Count' ? 0 : 2)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpressionBoxplot;