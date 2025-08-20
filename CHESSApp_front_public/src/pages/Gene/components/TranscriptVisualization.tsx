import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Transcript, GeneWithTranscripts, GeneCoordinates } from '../../../types/geneTypes';
import './TranscriptVisualization.css';

interface TranscriptVisualizationProps {
  gene: GeneWithTranscripts;
  onPrimaryTranscriptClick: (transcript: Transcript | null) => void;
  onSecondaryTranscriptClick: (transcript: Transcript | null) => void;
  primaryColor?: string;
  secondaryColor?: string;
  selectedPrimaryTranscript: Transcript | null;
  selectedSecondaryTranscript: Transcript | null;
}

interface TranscriptSegment {
  start: number;
  end: number;
  type: 'exon' | 'cds' | 'intron';
  segmentIndex: number;
  transcriptIndex: number;
  transcriptId: string;
}

const TranscriptVisualization: React.FC<TranscriptVisualizationProps> = ({
  gene,
  onPrimaryTranscriptClick,
  onSecondaryTranscriptClick,
  primaryColor = '#FF6B35',
  secondaryColor = '#9C27B0',
  selectedPrimaryTranscript,
  selectedSecondaryTranscript,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper to compute gene coordinates
  const computeGeneCoordinates = (gene: GeneWithTranscripts): GeneCoordinates => {
    const gene_start = gene.transcripts.reduce((min, transcript) => Math.min(min, transcript.exons[0][0]), Infinity);
    const gene_end = gene.transcripts.reduce((max, transcript) => Math.max(max, transcript.exons[transcript.exons.length - 1][1]), -Infinity);
    const sequence_id = gene.transcripts[0].sequence_id.toString();
    const strand = gene.transcripts[0].strand;

    return {
      start: gene_start,
      end: gene_end,
      sequence_id,
      strand,
    };
  };

  const geneCoordinates: GeneCoordinates = computeGeneCoordinates(gene);

  // Helper for transcript lookup
  const getTranscriptById = (id: string) => gene.transcripts.find(t => t.transcript_id === id);

  // Function to update transcript visual states
  const updateTranscriptVisualState = (
    primaryTranscriptId: string | null,
    secondaryTranscriptId: string | null
  ) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Reset all transcripts to normal state first
    svg.selectAll('[data-transcript-id]:not(.transcript-click-area)')
      .attr('stroke-width', function() {
        const element = d3.select(this);
        return element.classed('intron-segment') ? 2 : 1;
      })
      .attr('stroke', function() {
        const element = d3.select(this);
        if (element.classed('intron-segment')) return '#999';
        return '#333';
      })
      .attr('opacity', 1);

    if (primaryTranscriptId) {
      svg.selectAll(`[data-transcript-id="${primaryTranscriptId}"]:not(.transcript-click-area)`)
        .attr('stroke-width', function() {
          const element = d3.select(this);
          return element.classed('intron-segment') ? 2 : 1;
        })
        .attr('stroke', primaryColor)
        .attr('opacity', 1);
    }

    if (secondaryTranscriptId) {
      svg.selectAll(`[data-transcript-id="${secondaryTranscriptId}"]:not(.transcript-click-area)`)
        .attr('stroke-width', function() {
          const element = d3.select(this);
          return element.classed('intron-segment') ? 2 : 1;
        })
        .attr('stroke', secondaryColor)
        .attr('opacity', 1);
    }

    // Dim transcripts that are not selected
    if (primaryTranscriptId || secondaryTranscriptId) {
      svg.selectAll('[data-transcript-id]:not(.transcript-click-area)')
        .filter(function() {
          const transcriptId = d3.select(this).attr('data-transcript-id');
          return transcriptId !== primaryTranscriptId && transcriptId !== secondaryTranscriptId;
        })
        .attr('opacity', 0.3);
    }
  };

  useEffect(() => {
    if (!svgRef.current || !gene || !Array.isArray(gene.transcripts) || gene.transcripts.length === 0 || !geneCoordinates) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;

    // Calculate dynamic height based on number of transcripts
    const minHeight = 200;
    const maxHeight = 800;
    const transcriptHeight = 40;
    const baseHeight = 120;

    const calculatedHeight = Math.min(
      Math.max(minHeight, baseHeight + (gene.transcripts.length * transcriptHeight)),
      maxHeight
    );

    const height = calculatedHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr('width', width).attr('height', height);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([geneCoordinates.start, geneCoordinates.end])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, gene.transcripts.length])
      .range([margin.top, height - margin.bottom]);

    // Build transcript segments, grouped by transcript
    const transcriptSegments: TranscriptSegment[] = [];
    gene.transcripts.forEach((transcript, transcriptIndex) => {
      if (!transcript || !transcript.exons || !Array.isArray(transcript.exons) || !transcript.cds || !Array.isArray(transcript.cds)) {
        return;
      }
      const sortedExons = [...transcript.exons].sort((a, b) => a[0] - b[0]);
      for (let i = 0; i < sortedExons.length; i++) {
        const currentExon = sortedExons[i];
        const exonStart = currentExon[0];
        const exonEnd = currentExon[1];
        const overlappingCDS = transcript.cds.filter(cds => cds[0] <= exonEnd && cds[1] >= exonStart);
        if (overlappingCDS.length === 0) {
          transcriptSegments.push({
            start: exonStart,
            end: exonEnd,
            type: 'exon',
            segmentIndex: i,
            transcriptIndex,
            transcriptId: transcript.transcript_id,
          });
        } else {
          const sortedCDS = overlappingCDS.sort((a, b) => a[0] - b[0]);
          let currentPos = exonStart;
          for (let j = 0; j < sortedCDS.length; j++) {
            const cds = sortedCDS[j];
            const cdsStart = Math.max(cds[0], exonStart);
            const cdsEnd = Math.min(cds[1], exonEnd);
            if (currentPos < cdsStart) {
              transcriptSegments.push({
                start: currentPos,
                end: cdsStart,
                type: 'exon',
                segmentIndex: i,
                transcriptIndex,
                transcriptId: transcript.transcript_id,
              });
            }
            transcriptSegments.push({
              start: cdsStart,
              end: cdsEnd,
              type: 'cds',
              segmentIndex: i,
              transcriptIndex,
              transcriptId: transcript.transcript_id,
            });
            currentPos = cdsEnd;
          }
          if (currentPos < exonEnd) {
            transcriptSegments.push({
              start: currentPos,
              end: exonEnd,
              type: 'exon',
              segmentIndex: i,
              transcriptIndex,
              transcriptId: transcript.transcript_id,
            });
          }
        }
        // Add intron to next exon (except for the last exon)
        if (i < sortedExons.length - 1) {
          const nextExon = sortedExons[i + 1];
          transcriptSegments.push({
            start: exonEnd,
            end: nextExon[0],
            type: 'intron',
            segmentIndex: i,
            transcriptIndex,
            transcriptId: transcript.transcript_id,
          });
        }
      }
    });

    // Main chart group
    const chart = svg.append('g');

    // Axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d3.format(',')(d))
      .tickSize(-height + margin.top + margin.bottom);

    chart.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#ddd'))
      .call(g => g.selectAll('.tick text').attr('fill', '#666'));

    // Draw each transcript
    gene.transcripts.forEach((transcript, transcriptIndex) => {
      const y = yScale(transcriptIndex + 0.5);

      // Draw main transcript line
      chart.append('line')
        .attr('x1', xScale(geneCoordinates.start))
        .attr('x2', xScale(geneCoordinates.end))
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

      // Draw segments for this transcript only
      transcriptSegments
        .filter(seg => seg.transcriptIndex === transcriptIndex)
        .forEach(segment => {
          const segmentWidth = xScale(segment.end) - xScale(segment.start);
          if (segment.type === 'intron') {
            chart.append('line')
              .attr('x1', xScale(segment.start))
              .attr('x2', xScale(segment.end))
              .attr('y1', y)
              .attr('y2', y)
              .attr('stroke', '#999')
              .attr('stroke-width', 2)
              .attr('class', 'intron-segment')
              .attr('data-transcript-id', transcript.transcript_id);

            // Strand arrows
            const intronLength = segment.end - segment.start;
            const arrowCount = Math.max(1, Math.floor(intronLength / 5000));
            const arrowSpacing = intronLength / (arrowCount + 1);
            for (let i = 1; i <= arrowCount; i++) {
              const arrowPos = segment.start + (i * arrowSpacing);
              const arrowX = xScale(arrowPos);
              if (transcript.strand) {
                chart.append('polygon')
                  .attr('points', `${arrowX-4},${y-3} ${arrowX+4},${y} ${arrowX-4},${y+3}`)
                  .attr('fill', '#999')
                  .attr('class', 'strand-arrow')
                  .attr('data-transcript-id', transcript.transcript_id);
              } else {
                chart.append('polygon')
                  .attr('points', `${arrowX+4},${y-3} ${arrowX-4},${y} ${arrowX+4},${y+3}`)
                  .attr('fill', '#999')
                  .attr('class', 'strand-arrow')
                  .attr('data-transcript-id', transcript.transcript_id);
              }
            }
          } else {
            chart.append('rect')
              .attr('x', xScale(segment.start))
              .attr('y', y - (segment.type === 'cds' ? 10 : 8))
              .attr('width', segmentWidth)
              .attr('height', segment.type === 'cds' ? 20 : 16)
              .attr('fill', segment.type === 'cds' ? '#2196F3' : '#4CAF50')
              .attr('stroke', '#333')
              .attr('stroke-width', 1)
              .attr('class', 'exon-segment')
              .attr('data-transcript-id', transcript.transcript_id)
              .attr('data-segment-type', segment.type);
          }
        });

      // Add invisible clickable area
      chart.append('rect')
        .attr('x', margin.left)
        .attr('y', y - 25)
        .attr('width', width - margin.left - margin.right)
        .attr('height', 50)
        .attr('fill', 'transparent')
        .attr('stroke', 'none')
        .attr('class', 'transcript-click-area')
        .attr('data-transcript-id', transcript.transcript_id)
        .style('cursor', 'pointer');

      // Transcript label
      chart.append('text')
        .attr('x', margin.left)
        .attr('y', y - 15)
        .attr('text-anchor', 'start')
        .attr('fill', '#333')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(transcript.transcript_id);
    });

    // Handlers for click/contextmenu/hover
    chart.selectAll('.exon-segment, .intron-segment, .transcript-click-area')
      .on('click', function(event) {
        const transcriptId = d3.select(this).attr('data-transcript-id');
        const transcript = getTranscriptById(transcriptId);
        if (transcript) {
          if (selectedPrimaryTranscript?.transcript_id === transcriptId) {
            onPrimaryTranscriptClick(null);
          } else {
            onPrimaryTranscriptClick(transcript);
            if (selectedSecondaryTranscript?.transcript_id === transcriptId) {
              onSecondaryTranscriptClick(null);
            }
          }
        }
      })
      .on('contextmenu', function(event) {
        event.preventDefault();
        const transcriptId = d3.select(this).attr('data-transcript-id');
        const transcript = getTranscriptById(transcriptId);
        if (transcript) {
          if (selectedSecondaryTranscript?.transcript_id === transcriptId) {
            onSecondaryTranscriptClick(null);
          } else {
            onSecondaryTranscriptClick(transcript);
            if (selectedPrimaryTranscript?.transcript_id === transcriptId) {
              onPrimaryTranscriptClick(null);
            }
          }
        }
      })
      .on('mouseover', function() {
        const transcriptId = d3.select(this).attr('data-transcript-id');
        chart.selectAll(`[data-transcript-id="${transcriptId}"]:not(.transcript-click-area)`)
          .attr('opacity', 0.7)
          .style('cursor', 'pointer');
      })
      .on('mouseout', function() {
        const transcriptId = d3.select(this).attr('data-transcript-id');
        const isPrimarySelected = selectedPrimaryTranscript?.transcript_id === transcriptId;
        const isSecondarySelected = selectedSecondaryTranscript?.transcript_id === transcriptId;
        const isSelected = isPrimarySelected || isSecondarySelected;
        chart.selectAll(`[data-transcript-id="${transcriptId}"]:not(.transcript-click-area)`)
          .attr('opacity', isSelected ? 1 : ((selectedPrimaryTranscript || selectedSecondaryTranscript) ? 0.3 : 1));
      });

    updateTranscriptVisualState(
      selectedPrimaryTranscript?.transcript_id || null,
      selectedSecondaryTranscript?.transcript_id || null
    );
  }, [gene, onPrimaryTranscriptClick, onSecondaryTranscriptClick, selectedPrimaryTranscript, selectedSecondaryTranscript, primaryColor, secondaryColor]);

  // Window resize: update SVG width
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current && gene.transcripts.length > 0 && geneCoordinates) {
        const width = svgRef.current.clientWidth;
        const svg = d3.select(svgRef.current);
        svg.attr('width', width);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gene]);

  // Selection state effect
  useEffect(() => {
    updateTranscriptVisualState(
      selectedPrimaryTranscript?.transcript_id || null,
      selectedSecondaryTranscript?.transcript_id || null
    );
  }, [selectedPrimaryTranscript, selectedSecondaryTranscript, primaryColor, secondaryColor]);

  return (
    <div className="visualization-container">
      <svg ref={svgRef} className="transcript-svg"></svg>
    </div>
  );
};

export default TranscriptVisualization;