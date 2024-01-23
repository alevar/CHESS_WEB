import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const SashimiPlot: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Data for rectangles
    const rectanglesData = [
      { id: 1, x: 50, y: 50, width: 100, height: 50, color: 'blue' },
      { id: 2, x: 200, y: 50, width: 100, height: 50, color: 'green' },
      { id: 3, x: 350, y: 50, width: 100, height: 50, color: 'red' },
    ];

    // Create rectangles
    svg
      .selectAll('rect')
      .data(rectanglesData)
      .enter()
      .append('rect')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', (d) => d.color)
      .call(
        d3
          .drag<SVGSVGElement, { x: number; y: number }>()
          .on('drag', (event, d) => {
            d.x = event.x;
            d.y = event.y;
            d3.select(event.target)
              .attr('x', d.x)
              .attr('y', d.y);
          })
      );
  }, []);

  return (
    <svg ref={svgRef} width={500} height={150}>
      {/* SVG content goes here */}
    </svg>
  );
};

export default SashimiPlot;