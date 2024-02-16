import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { TX, Locus } from '../../../../../utils/utils';

interface SashimiProps {
  locus: Locus;
  dimensions: {
    width: number,
    height: number,
    arrowSize: number,
    arrowSpacing: number
  };
  tx: TX;
}

const SashimiPlot: React.FC<SashimiProps> = ({ locus, dimensions, tx }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    let exon_svgs = [];
    let intron_svgs = [];
    let orf_svgs = [];
    svg.selectAll("*").remove();

    let e_i = 0;
    let prev_exon = [0, 0];
    tx.exons.forEach(exon => {
      const graph_exon_start = locus.convert(exon[0], [0, dimensions.width]);
      const graph_exon_end = locus.convert(exon[1], [0, dimensions.width]);
      const graph_width = graph_exon_end - graph_exon_start;

      const exonSvg = svg
        .append('rect')
        .attr('x', graph_exon_start)
        .attr('y', dimensions.height * ((1 - 0.75) / 2))
        .attr('width', graph_width)
        .attr('height', dimensions.height * 0.75)
        .style('fill', '#3652AD');
      exon_svgs.push(exonSvg);

      if (e_i > 0) {
        const intron_graphcoord_length = graph_exon_start - prev_exon[1];

        // divide intron into segments of length arrowSpacing
        let arrow_segments = [];
        let arrow_start = intron_graphcoord_length % dimensions.arrowSpacing;
        if (arrow_start > 0) {
          arrow_segments.push([0, (arrow_start / 2)]);
        }
        for (let distance = arrow_start / 2; distance < intron_graphcoord_length - dimensions.arrowSpacing; distance += dimensions.arrowSpacing) {
          arrow_segments.push([distance, distance + dimensions.arrowSpacing]);
        }
        // add last segment if necessary
        if (arrow_start > 0) {
          arrow_segments.push([intron_graphcoord_length - (arrow_start / 2), intron_graphcoord_length]);
        }

        // iterate over segments and draw arrows
        for (const segment of arrow_segments) {
          const intronSvg = svg
            .append('line')
            .attr('x1', prev_exon[1] + segment[0])
            .attr('y1', dimensions.height / 2) // Adjust y position as needed
            .attr('x2', prev_exon[1] + segment[1])
            .attr('y2', dimensions.height / 2) // Adjust y position as needed
            .style('stroke', '#280274') // Adjust line color for gene labels
            .style('stroke-width', 1);

          // if ((segment[1] - segment[0]) == dimensions.arrowSpacing) {
          //   const arrow = svg
          //     .append('marker')
          //     .attr('id', 'arrow')
          //     .attr('markerWidth', dimensions.arrowSize)
          //     .attr('markerHeight', dimensions.arrowSize)
          //     .attr('refX', dimensions.arrowSize / 2)
          //     .attr('refY', dimensions.arrowSize / 2)
          //     .attr('orient', 'auto');

          //   arrow
          //     .append('path')
          //     .attr('d', `M0,0 L${dimensions.arrowSize}, ${dimensions.arrowSize / 2} L0,${dimensions.arrowSize} Z`)
          //     .style('fill', '#280274');

          //   intronSvg.attr('marker-end', 'url(#arrow)');
          // }

          intron_svgs.push(intronSvg);
        }
      }

      e_i += 1; // increment index
      prev_exon = [graph_exon_start, graph_exon_end];
    });

    // now plot ORFs if available
    let c_i = 0;
    let prev_cds = [0, 0];
    tx.orf.forEach(cds => {
      const graph_cds_start = locus.convert(cds[0], [0, dimensions.width]);
      const graph_cds_end = locus.convert(cds[1], [0, dimensions.width]);
      const graph_width = graph_cds_end - graph_cds_start;

      const cdsSvg = svg
        .append('rect')
        .attr('x', graph_cds_start)
        .attr('y', 0)
        .attr('width', graph_width)
        .attr('height', dimensions.height)
        .style('fill', '#56b4e9');

      orf_svgs.push(cdsSvg);

      c_i += 1; // increment index
      prev_cds = [graph_cds_start, graph_cds_end];
    });
  }, [locus, dimensions]);

  return (
    <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
    </svg>
  );
};

export default SashimiPlot;