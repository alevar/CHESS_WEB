import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Transcript } from '../../redux/gene/geneSlice';
import './TranscriptVisualization.css';

interface TranscriptVisualizationProps {
  transcripts: Transcript[];
  geneCoordinates: {
    start: number;
    end: number;
    sequence_id: string;
    strand: boolean | null;
  } | null;
  onTranscriptClick: (transcript: Transcript | null) => void;
  selectedTranscript?: Transcript | null;
  isTranscriptLoading?: boolean;
  onSecondaryTranscriptClick: (transcript: Transcript | null) => void;
  selectedSecondaryTranscript?: Transcript | null;
  isSecondaryTranscriptLoading?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

interface TranscriptSegment {
  start: number;
  end: number;
  type: 'exon' | 'cds' | 'intron';
  transcript: Transcript;
  segmentIndex: number;
}

const TranscriptVisualization: React.FC<TranscriptVisualizationProps> = ({
  transcripts,
  geneCoordinates,
  onTranscriptClick,
  selectedTranscript: externalSelectedTranscript,
  isTranscriptLoading = false,
  onSecondaryTranscriptClick,
  selectedSecondaryTranscript: externalSelectedSecondaryTranscript,
  isSecondaryTranscriptLoading = false,
  primaryColor = '#FF6B35',
  secondaryColor = '#9C27B0',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [internalSelectedTranscript, setInternalSelectedTranscript] = useState<Transcript | null>(null);
  const [internalSelectedSecondaryTranscript, setInternalSelectedSecondaryTranscript] = useState<Transcript | null>(null);

  // Use external selection if provided, otherwise use internal
  const selectedTranscript = externalSelectedTranscript || internalSelectedTranscript;
  const selectedSecondaryTranscript = externalSelectedSecondaryTranscript || internalSelectedSecondaryTranscript;

  // Function to update transcript visual states
  const updateTranscriptVisualState = useCallback((primaryTranscriptId: string | null, secondaryTranscriptId: string | null) => {
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
      // Highlight primary transcript
      svg.selectAll(`[data-transcript-id="${primaryTranscriptId}"]:not(.transcript-click-area)`)
        .attr('stroke-width', function() {
          const element = d3.select(this);
          return element.classed('intron-segment') ? 2 : 1;
        })
        .attr('stroke', primaryColor)
        .attr('opacity', 1);
    }
    
    if (secondaryTranscriptId) {
      // Highlight secondary transcript with different color
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
  }, [primaryColor, secondaryColor]);

  useEffect(() => {
    if (!svgRef.current || !transcripts || !Array.isArray(transcripts) || transcripts.length === 0 || !geneCoordinates) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    
    // Calculate dynamic height based on number of transcripts
    const minHeight = 200; // Minimum height for small transcript counts
    const maxHeight = 800; // Maximum height to prevent excessive scrolling
    const transcriptHeight = 40; // Height per transcript (including margins)
    const baseHeight = 120; // Base height for margins, axis, etc.
    
    const calculatedHeight = Math.min(
      Math.max(minHeight, baseHeight + (transcripts.length * transcriptHeight)),
      maxHeight
    );
    
    const height = calculatedHeight;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Set SVG dimensions
    svg.attr('width', width).attr('height', height);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([geneCoordinates.start, geneCoordinates.end])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, transcripts.length])
      .range([margin.top, height - margin.bottom]);

    // Create segments for each transcript
    const transcriptSegments: TranscriptSegment[] = [];
    
    transcripts.forEach((transcript, transcriptIndex) => {
      if (!transcript || !transcript.exons || !Array.isArray(transcript.exons) || !transcript.cds || !Array.isArray(transcript.cds)) {
        return; // Skip invalid transcript
      }
      
      const segments: TranscriptSegment[] = [];
      
      // Sort exons by start position
      const sortedExons = [...transcript.exons].sort((a, b) => a[0] - b[0]);
      
      // Process each exon to split into coding and non-coding portions
      for (let i = 0; i < sortedExons.length; i++) {
        const currentExon = sortedExons[i];
        const exonStart = currentExon[0];
        const exonEnd = currentExon[1];
        
        // Find all CDS regions that overlap with this exon
        const overlappingCDS = transcript.cds.filter(cds => 
          cds[0] <= exonEnd && cds[1] >= exonStart
        );
        
        if (overlappingCDS.length === 0) {
          // No CDS overlap - entire exon is non-coding
          segments.push({
            start: exonStart,
            end: exonEnd,
            type: 'exon',
            transcript,
            segmentIndex: i
          });
        } else {
          // Sort overlapping CDS regions by start position
          const sortedCDS = overlappingCDS.sort((a, b) => a[0] - b[0]);
          
          let currentPos = exonStart;
          
          // Process each CDS region and the gaps between them
          for (let j = 0; j < sortedCDS.length; j++) {
            const cds = sortedCDS[j];
            const cdsStart = Math.max(cds[0], exonStart);
            const cdsEnd = Math.min(cds[1], exonEnd);
            
            // Add non-coding portion before this CDS (if any)
            if (currentPos < cdsStart) {
              segments.push({
                start: currentPos,
                end: cdsStart,
                type: 'exon',
                transcript,
                segmentIndex: i
              });
            }
            
            // Add CDS portion
            segments.push({
              start: cdsStart,
              end: cdsEnd,
              type: 'cds',
              transcript,
              segmentIndex: i
            });
            
            currentPos = cdsEnd;
          }
          
          // Add non-coding portion after the last CDS (if any)
          if (currentPos < exonEnd) {
            segments.push({
              start: currentPos,
              end: exonEnd,
              type: 'exon',
              transcript,
              segmentIndex: i
            });
          }
        }
        
        // Add intron to next exon (except for the last exon)
        if (i < sortedExons.length - 1) {
          const nextExon = sortedExons[i + 1];
          segments.push({
            start: exonEnd,
            end: nextExon[0],
            type: 'intron',
            transcript,
            segmentIndex: i
          });
        }
      }
      
      transcriptSegments.push(...segments);
    });

    // Create the main chart group
    const chart = svg.append('g');

    // Add axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d3.format(',')(d))
      .tickSize(-height + margin.top + margin.bottom);

    chart.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#ddd'))
      .call(g => g.selectAll('.tick text').attr('fill', '#666'));

    // Draw transcript lines
    transcripts.forEach((transcript, transcriptIndex) => {
      const y = yScale(transcriptIndex + 0.5);
      
      // Draw the main transcript line
      chart.append('line')
        .attr('x1', xScale(geneCoordinates.start))
        .attr('x2', xScale(geneCoordinates.end))
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

      // Draw segments
      transcriptSegments
        .filter(segment => segment.transcript === transcript)
        .forEach(segment => {
          let segmentWidth: number;
          
          if (segment.type === 'intron') {
            // Draw intron at full width
            segmentWidth = xScale(segment.end) - xScale(segment.start);
            
            // Draw intron line
            chart.append('line')
              .attr('x1', xScale(segment.start))
              .attr('x2', xScale(segment.end))
              .attr('y1', y)
              .attr('y2', y)
              .attr('stroke', '#999')
              .attr('stroke-width', 2)
              .attr('class', 'intron-segment')
              .attr('data-transcript-id', transcript.transcript_id);
            
            // Add strand direction arrows
            const intronLength = segment.end - segment.start;
            const arrowCount = Math.max(1, Math.floor(intronLength / 5000)); // One arrow per 5kb, minimum 1
            const arrowSpacing = intronLength / (arrowCount + 1);
            
            for (let i = 1; i <= arrowCount; i++) {
              const arrowPos = segment.start + (i * arrowSpacing);
              const arrowX = xScale(arrowPos);
              
              // Create arrow based on strand direction
              if (transcript.strand) {
                // Positive strand (→): arrow points right
                chart.append('polygon')
                  .attr('points', `${arrowX-4},${y-3} ${arrowX+4},${y} ${arrowX-4},${y+3}`)
                  .attr('fill', '#999')
                  .attr('class', 'strand-arrow')
                  .attr('data-transcript-id', transcript.transcript_id);
              } else {
                // Negative strand (←): arrow points left
                chart.append('polygon')
                  .attr('points', `${arrowX+4},${y-3} ${arrowX-4},${y} ${arrowX+4},${y+3}`)
                  .attr('fill', '#999')
                  .attr('class', 'strand-arrow')
                  .attr('data-transcript-id', transcript.transcript_id);
              }
            }
          } else {
            // Full scale for exons
            segmentWidth = xScale(segment.end) - xScale(segment.start);
            
            // Draw exon
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

      // Add invisible clickable rectangle over the entire transcript for easier selection
      chart.append('rect')
        .attr('x', margin.left)
        .attr('y', y - 25) // Extend above and below the transcript line
        .attr('width', width - margin.left - margin.right)
        .attr('height', 50) // Height to cover transcript line and labels
        .attr('fill', 'transparent')
        .attr('stroke', 'none')
        .attr('class', 'transcript-click-area')
        .attr('data-transcript-id', transcript.transcript_id)
        .style('cursor', 'pointer');

      // Add transcript label above the transcript
      chart.append('text')
        .attr('x', margin.left)
        .attr('y', y - 15)
        .attr('text-anchor', 'start')
        .attr('fill', '#333')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .text(transcript.transcript_id);
      
      // Add loading indicator if this transcript is selected and loading
      if (selectedTranscript?.transcript_id === transcript.transcript_id && isTranscriptLoading) {
        chart.append('text')
          .attr('x', margin.left)
          .attr('y', y + 25)
          .attr('text-anchor', 'start')
          .attr('fill', '#007bff')
          .attr('font-size', '10px')
          .attr('font-style', 'italic')
          .text('Loading...');
      }
    });

    // Add click handlers and hover effects for segments and transcript click areas
    chart.selectAll('.exon-segment, .intron-segment, .transcript-click-area')
      .on('click', function(event, d) {
        event.preventDefault();
        const transcriptId = d3.select(this).attr('data-transcript-id');
        const transcript = transcripts.find(t => t.transcript_id === transcriptId);
        if (transcript) {
          // Left click for primary transcript - clear secondary if it's the same transcript
          if (selectedTranscript?.transcript_id === transcriptId) {
            // If clicking the same transcript that's already primary, clear it
            setInternalSelectedTranscript(null);
            onTranscriptClick(null);
          } else {
            // Set as primary transcript
            setInternalSelectedTranscript(transcript);
            onTranscriptClick(transcript);
            
            // Clear secondary if it's the same transcript
            if (selectedSecondaryTranscript?.transcript_id === transcriptId) {
              setInternalSelectedSecondaryTranscript(null);
              onSecondaryTranscriptClick(null);
            }
          }
        }
      })
      .on('contextmenu', function(event, d) {
        event.preventDefault();
        const transcriptId = d3.select(this).attr('data-transcript-id');
        const transcript = transcripts.find(t => t.transcript_id === transcriptId);
        if (transcript) {
          // Right click for secondary transcript - clear primary if it's the same transcript
          if (selectedSecondaryTranscript?.transcript_id === transcriptId) {
            // If clicking the same transcript that's already secondary, clear it
            setInternalSelectedSecondaryTranscript(null);
            onSecondaryTranscriptClick(null);
          } else {
            // Set as secondary transcript
            setInternalSelectedSecondaryTranscript(transcript);
            onSecondaryTranscriptClick(transcript);
            
            // Clear primary if it's the same transcript
            if (selectedTranscript?.transcript_id === transcriptId) {
              setInternalSelectedTranscript(null);
              onTranscriptClick(null);
            }
          }
        }
      })
      .on('mouseover', function() {
        const transcriptId = d3.select(this).attr('data-transcript-id');
        // Highlight entire transcript on hover (excluding click areas)
        chart.selectAll(`[data-transcript-id="${transcriptId}"]:not(.transcript-click-area)`)
          .attr('opacity', 0.7)
          .style('cursor', 'pointer');
      })
      .on('mouseout', function() {
        const transcriptId = d3.select(this).attr('data-transcript-id');
        // Reset opacity for entire transcript, but preserve selection state (excluding click areas)
        const isPrimarySelected = selectedTranscript?.transcript_id === transcriptId;
        const isSecondarySelected = selectedSecondaryTranscript?.transcript_id === transcriptId;
        const isSelected = isPrimarySelected || isSecondarySelected;
        
        chart.selectAll(`[data-transcript-id="${transcriptId}"]:not(.transcript-click-area)`)
          .attr('opacity', isSelected ? 1 : ((selectedTranscript || selectedSecondaryTranscript) ? 0.3 : 1));
      });

    // Apply selection state after drawing is complete
    updateTranscriptVisualState(
      selectedTranscript?.transcript_id || null,
      selectedSecondaryTranscript?.transcript_id || null
    );

  }, [transcripts, geneCoordinates, onTranscriptClick, onSecondaryTranscriptClick, selectedTranscript, selectedSecondaryTranscript, isTranscriptLoading, isSecondaryTranscriptLoading, primaryColor, secondaryColor, updateTranscriptVisualState]);

  // Handle window resize to recalculate dimensions
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current && transcripts.length > 0 && geneCoordinates) {
        // Simple resize handling - just update width
        const width = svgRef.current.clientWidth;
        const svg = d3.select(svgRef.current);
        svg.attr('width', width);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [transcripts, geneCoordinates]);

  // Handle transcript selection changes
  useEffect(() => {
    updateTranscriptVisualState(
      selectedTranscript?.transcript_id || null,
      selectedSecondaryTranscript?.transcript_id || null
    );
  }, [selectedTranscript, selectedSecondaryTranscript, primaryColor, secondaryColor, updateTranscriptVisualState]);

  return (
    <div className="transcript-visualization">
      <div className="visualization-container">
        <svg ref={svgRef} className="transcript-svg"></svg>
      </div>
      {/* Legend for dual transcript mode */}
      {selectedTranscript && selectedSecondaryTranscript && (
        <div className="transcript-legend">
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: primaryColor }}
            ></div>
            <span>Primary Transcript (Left Click)</span>
          </div>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: secondaryColor }}
            ></div>
            <span>Secondary Transcript (Right Click)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptVisualization;