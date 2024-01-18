import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from 'react-bootstrap';

import HintIcon from '../../../../../HintIcon/HintIcon';
import SankeyPlot from './components/SankeyPlot/SankeyPlot';

import { DatabaseState } from '../../../../../../features/database/databaseSlice';
import { SettingsState } from '../../../../../../features/settings/settingsSlice';
import { SummaryState } from '../../../../../../features/summary/summarySlice';
import * as d3 from 'd3';

interface SummaryViewProps {
  parentWidth: number;
  parentHeight: number;
}

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
  summary: SummaryState;
}

const SummaryView: React.FC<SummaryViewProps> = ({ parentWidth, parentHeight }) => {
  const globalData = useSelector((state: RootState) => state.database);
  const settings = useSelector((state: RootState) => state.settings);
  const summary = useSelector((state: RootState) => state.summary);

  // process summary data to extract the data for the current view
  const [sankeyData, setSankeyData] = useState({});
  useEffect(() => {
    let max_id = 0; // the next available ID for a node in sankey data
    let source_map = {}; // map of sourceIDs to sankey node IDs
    let gene_type_map = {}; // map of gene type IDs to sankey node IDs
    let transcript_type_map = {}; // map of transcript type IDs to sankey node IDs

    let newSankeyData = {nodes:[],links:[]};

    // first add the source nodes
    for (const [sourceID, gene_types] of Object.entries(summary.data.sourceSummary)) {
      // add source node
      const source_node = { node: max_id, name: globalData.data.sources[sourceID].name };
      newSankeyData.nodes.push(source_node);
      source_map[sourceID] = max_id;
      max_id += 1;
      
      for (let [gene_type, transcript_types] of Object.entries(gene_types)) {
        // add gene type node
        let gene_type_name = "Unknown";
        if (gene_type === "None" || gene_type === ""){
          gene_type = "Unknown";
        }
        else{
          gene_type_name = globalData.data.gene_types[gene_type].value;
        }
        const gene_type_node = { node: max_id, name: gene_type_name };
        if (!(gene_type in gene_type_map)){
          gene_type_map[gene_type] = max_id;
          max_id += 1;
          newSankeyData.nodes.push(gene_type_node);
        }

        // get total number of transcripts for this gene type
        let total_transcripts = 0;
        for (const [transcript_type, count] of Object.entries(transcript_types)) {
          total_transcripts += count;
        }

        // add links from source to gene type
        const source_node_id = source_map[sourceID];
        const gene_type_node_id = gene_type_map[gene_type];
        const link = { source: source_node_id, target: gene_type_node_id, value: total_transcripts };
        newSankeyData.links.push(link);

        for (let [transcript_type, count] of Object.entries(transcript_types)) {
          // add transcript type node
          if (gene_type === "None" || gene_type === ""){
            gene_type = "Unknown";
          }
          let transcript_type_name = "Unknown";
          if (transcript_type === "None" || gene_type === ""){
            transcript_type = "Unknown";
          }
          else{
            transcript_type_name = globalData.data.transcript_types[transcript_type].value;
          }
          const transcript_type_node = { node: max_id, name: transcript_type_name };
          if (!(transcript_type in transcript_type_map)){
            transcript_type_map[transcript_type] = max_id;
            max_id += 1;
            newSankeyData.nodes.push(transcript_type_node);
          }

          // add links from gene type to transcript type
          const gene_type_node_id = gene_type_map[gene_type];
          const transcript_type_node_id = transcript_type_map[transcript_type];
          const link = { source: gene_type_node_id, target: transcript_type_node_id, value: count };
          newSankeyData.links.push(link);
        }
      }
    }

    console.log("new sankey data", newSankeyData);
    setSankeyData(newSankeyData);
  }, [summary.data.sourceSummary]);

  return (
    <div className="custom-container" style={{ overflow: 'auto' }}>
        {summary.status === "loading" ? (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        ) : summary.status === "succeeded" ? (
            <SankeyPlot data={sankeyData} parentWidth={parentWidth} parentHeight={parentHeight}/>
        ) : (
            <div>
                Error loading summary slice
            </div>
        )}
    </div>
  );
};

export default SummaryView;
