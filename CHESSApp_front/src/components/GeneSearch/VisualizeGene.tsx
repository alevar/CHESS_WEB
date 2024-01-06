import { useEffect } from "react";
import { useState } from "react";
import * as d3 from "d3";

// SAMPLE DATA FROM CHESS:
//
// CM000680.2  CHESS.3.0 transcript  47221 49615 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 exon  47221 48447 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 exon  48940 49050 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 exon  49129 49237 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 exon  49501 49615 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 CDS 47393 48447 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 CDS 48940 49050 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 CDS 49129 49237 . - . transcript_id "CHS.128994.1";
// CM000680.2  CHESS.3.0 CDS 49501 49557 . - . transcript_id "CHS.128994.1";

// Used for the printing the gene visualization details, not actually used for the visualization
// Based on CHESS Data Above
const geneData = {
    transcript: [{ start: 47221, end: 49615 }],
    exons: [
      { start: 47221, end: 48447 },
      { start: 48940, end: 49050 },
      { start: 49129, end: 49237 },
      { start: 49501, end: 49615 }
    ],
    cds: [
      { start: 47393, end: 48447 },
      { start: 48940, end: 49050 },
      { start: 49129, end: 49237 },
      { start: 49501, end: 49557 }
    ]
  };

const VisualizeGene = () => {
    useEffect(() => {
      // Sample data for demonstration
      const geneData = {
        exons: [{ start: 100, end: 300, additionalParameter: "Exon Detail 1" }],
        introns: [{ start: 305, end: 495, additionalParameter: "Intron Detail 1" }],
        cds: [{ start: 150, end: 250, additionalParameter: "CDS Detail 1" }],
      };
  
      // Set up SVG container
      const svgWidth = 500;
      const svgHeight = 100;
      const svg = d3.select("#gene-visualization")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
  
      // Scale for positioning gene features
      const xScale = d3.scaleLinear()
        .domain([0, geneData.exons[0].end])
        .range([0, svgWidth]);
  
      // Draw Exons
      svg.selectAll("rect.exon")
        .data(geneData.exons)
        .enter()
        .append("rect")
        .attr("class", "exon")
        .attr("x", d => xScale(d.start))
        .attr("y", 20)
        .attr("width", d => xScale(d.end) - xScale(d.start))
        .attr("height", 20)
        .attr("fill", "lightblue");
  
      // Draw Introns
      svg.selectAll("rect.intron")
        .data(geneData.introns)
        .enter()
        .append("rect")
        .attr("class", "intron")
        .attr("x", d => xScale(d.start))
        .attr("y", 20)
        .attr("width", d => xScale(d.end) - xScale(d.start))
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1);
  
      // Draw CDS
      svg.selectAll("rect.cds")
        .data(geneData.cds)
        .enter()
        .append("rect")
        .attr("class", "cds")
        .attr("x", d => xScale(d.start))
        .attr("y", 20)
        .attr("width", d => xScale(d.end) - xScale(d.start))
        .attr("height", 20)
        .attr("fill", "lightgreen");
  
    }, []); // Empty dependency array to ensure the effect runs only once on mount
  
    return (
        <div>
            <div style={{ border: '2px solid darkgrey', background: 'lightyellow', padding: '10px', marginBottom: '20px' }}>
                <h3>Visualization Details</h3>
                <div>
                    <strong>Transcript Parameters:</strong>
                    <div>
                    Start: {geneData.transcript[0].start}, End: {geneData.transcript[0].end}
                    </div>
                </div>
                <div>
                    <strong>Exon Parameters:</strong> 
                    <div>{geneData.exons.map((exon:any, index:any) => `Exon ${index + 1}: Start - ${exon.start}, End - ${exon.end}`).join(', ')}</div>
                </div>
                <div>
                    <strong>CDS Parameters:</strong>
                    <div>{geneData.cds.map((cds:any, index:any) => `CDS ${index + 1}: Start - ${cds.start}, End - ${cds.end}`).join(', ')}</div>
                </div>
            </div>
        <div id="gene-visualization"></div>
      </div>
    );
  };
  
  export default VisualizeGene;


