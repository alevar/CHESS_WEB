import { useEffect } from "react";
import * as d3 from "d3";


const VisualizeGene = () => {
    useEffect(() => {
      // Sample data for demonstration
      const geneData = {
        exons: [{ start: 100, end: 300 }],
        introns: [{ start: 305, end: 495 }],
        cds: [{ start: 150, end: 250 }],
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
            <h6>Visualization Details</h6>
            <div>
              <strong>Exon Parameters:</strong> Exon Details
            </div>
            <div>
              <strong>Intron Parameters:</strong> Intron Details
            </div>
            <div>
              <strong>CDS Parameters:</strong> CDS Details
            </div>
          </div>
    
          <div id="gene-visualization"></div>
        </div>
      );
  };
  
  export default VisualizeGene;