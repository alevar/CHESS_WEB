import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { TX, Locus } from '../../../../../utils/utils';

interface SashimiProps {
  locus: Locus;
  dimensions: { width: number, height: number };
}

const SashimiPlot: React.FC<SashimiProps> = ({ locus, dimensions }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    let exon_svgs = [];
    let intron_svgs = [];
    let orf_svgs = [];
    svg.selectAll("*").remove();

    const tx_height = dimensions.height / locus.txs.length;

    let t_i = 0;
    for (const tx of locus.txs) {
      let e_i = 0;
      let prev_exon = [0, 0];
      tx.exons.forEach(exon => {
        const rel_exon_start = exon[0] - locus.start;
        const rel_exon_end = exon[1] - locus.start;
        const graph_exon_start = locus.convert(exon[0], [0, dimensions.width]);
        const graph_exon_end = locus.convert(exon[1], [0, dimensions.width]);
        const graph_width = graph_exon_end - graph_exon_start;

        const exon_start = (exon[0] / locus.get_length()) * dimensions.width;
        const exon_end = (exon[1] / locus.get_length()) * dimensions.width;
        const exonSvg = svg
          .append('rect')
          .attr('x', graph_exon_start)
          .attr('y', t_i * tx_height + tx_height * ((1 - 0.5) / 2))
          .attr('width', graph_width)
          .attr('height', tx_height * 0.5)
          .style('fill', '#3652AD');
        exon_svgs.push(exonSvg);

        if (e_i > 0) {
          const lineData = [
            [prev_exon[1], (t_i * tx_height) + (tx_height / 2)],
            [graph_exon_start, (t_i * tx_height) + (tx_height / 2)],
          ];

          const intron_graphcoord_length = graph_exon_start - prev_exon[1];
          const lineGenerator = d3.line();
          const arrowSize = 8;
          const arrowSpacing = 100;

          for (let distance = 0; distance < intron_graphcoord_length; distance += arrowSpacing) {
            const arrow = svg
              .append('marker')
              .attr('id', 'arrow')
              .attr('markerWidth', arrowSize)
              .attr('markerHeight', arrowSize)
              .attr('refX', arrowSize / 2)
              .attr('refY', arrowSize / 2)
              .attr('orient', 'auto');

            arrow
              .append('path')
              .attr('d', `M0,0 L${arrowSize}, ${arrowSize / 2} L0,${arrowSize} Z`)
              .style('fill', '#280274');

            const intronSvg = svg
              .append('line')
              .attr('x1', prev_exon[1])
              .attr('y1', (t_i*tx_height) + (tx_height/2)) // Adjust y position as needed
              .attr('x2', prev_exon[1] + distance)
              .attr('y2', (t_i*tx_height) + (tx_height/2)) // Adjust y position as needed
              .style('stroke', '#280274') // Adjust line color for gene labels
              .style('stroke-width', 1)
              .attr('marker-end', 'url(#arrow)');
              
            intron_svgs.push(intronSvg);
          }
        }

        e_i += 1; // increment index
        prev_exon = [graph_exon_start, graph_exon_end];
      });
      t_i += 1; // increment index
    }
  }, [locus, dimensions]);

  return (
    <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
      {/* SVG content goes here */}
    </svg>
  );
};

export default SashimiPlot;