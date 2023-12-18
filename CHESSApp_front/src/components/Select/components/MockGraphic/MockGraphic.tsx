import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface MockGraphicProps {
  data: {
    type: string;
    genes: number;
    transcripts: number;
  }[];
}

const MockGraphic: React.FC<MockGraphicProps> = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const svg = d3.select(chartRef.current);

      // Clear existing elements
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = 400 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
      const x1 = d3.scaleBand().padding(0.05);
      const y = d3.scaleLinear().rangeRound([height, 0]);

      const color = d3.scaleOrdinal().range(['#2196F3', '#4CAF50']);

      const chart = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const types = data.map((d) => d.type);
      const genesKeys = ['genes', 'transcripts'];

      x0.domain(types);
      x1.domain(genesKeys).rangeRound([0, x0.bandwidth()]);
      y.domain([0, d3.max(data, (d) => Math.max(d.genes, d.transcripts))]);

      chart
        .append('g')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${x0(d.type) || 0},0)`)
        .selectAll('rect')
        .data((d) => genesKeys.map((key) => ({ key, value: d[key] })))
        .enter()
        .append('rect')
        .attr('x', (d) => x1(d.key) || 0)
        .attr('y', (d) => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', (d) => height - y(d.value))
        .attr('fill', (d) => color(d.key));

      chart
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0));

      chart.append('g').attr('class', 'axis').call(d3.axisLeft(y));

      // Legend
      const legend = chart
        .append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'end')
        .selectAll('g')
        .data(genesKeys.slice().reverse())
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(0,${i * 20})`);

      legend
        .append('rect')
        .attr('x', width - 19)
        .attr('width', 19)
        .attr('height', 19)
        .attr('fill', color);

      legend
        .append('text')
        .attr('x', width - 24)
        .attr('y', 9.5)
        .attr('dy', '0.32em')
        .text((d) => d);

      // Cleanup function
      return () => {
        svg.selectAll('*').remove();
      };
    }
  }, [data]);

  return <svg ref={chartRef} width={400} height={300}></svg>;
};

export default MockGraphic;
