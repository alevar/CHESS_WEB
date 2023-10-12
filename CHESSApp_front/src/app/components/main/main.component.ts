import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/data/data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  view: any[] = [700, 400];
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  chartData: any[] = [];

  showXAxis = true;
  showYAxis = true;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Seq ID';
  yAxisLabel = 'Count';

  user_requested_data: any = {};

  constructor(private http: HttpClient, private dataService: DataService) {
    this.dataService.settingsUpdated.subscribe((settings) => {
      this.http.post('http://localhost:5000/api/main/fetchData', this.dataService.settings).subscribe((response) => {
        this.user_requested_data = response;
        this.createChart();
      });
    });
  }

  downloadData() {
    this.http.get<any[]>('http://localhost:5000/api/main/generateFile').subscribe((response) => {
      this.chartData = response;
    });
  }

  createChart() {
    console.log("creating Chart");
    // set the dimensions and margins of the graph
    const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse the Data
    const data = [
      { Tissue: "Brain", Data: {GeneCount: 100, TXCount: 500} },
      { Tissue: "Lung", Data: {GeneCount: 40, TXCount: 300} },
      { Tissue: "Testis", Data: {GeneCount: 76, TXCount: 250} },
      { Tissue: "Liver", Data: {GeneCount: 120, TXCount: 350} },
      { Tissue: "Skin", Data: {GeneCount: 55, TXCount: 180} }
    ];
    // X axis
    const x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(d => d['Tissue']))
    .padding(0.2);
    svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

    // Add Y axis
    const y = d3.scaleLinear()
    .domain([0, 200])
    .range([ height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
    .data(data)
    .join("rect")
    .attr("x", d => x(d['Tissue']) as number)
    .attr("y", d => y(Number(d['Data']["GeneCount"])))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(Number(d['Data']["GeneCount"])))
    .attr("fill", "#69b3a2")

  }
}