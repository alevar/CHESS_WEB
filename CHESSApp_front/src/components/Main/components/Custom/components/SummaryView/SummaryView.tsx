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

  // const sankeyData = {
  //     nodes: [
  //         { node: 0, name: 'Source 1' },
  //         { node: 1, name: 'Source 2' },
  //         { node: 2, name: 'Gene Type 1' },
  //         { node: 3, name: 'Gene Type 2' },
  //         { node: 4, name: 'Transcript Type 1' },
  //         { node: 5, name: 'Transcript Type 2' },
  //     ],
  //     links: [
  //         { source: 0, target: 2, value: 10 },
  //         { source: 0, target: 3, value: 20 },
  //         { source: 1, target: 2, value: 15 },
  //         { source: 1, target: 3, value: 25 },
  //         { source: 2, target: 4, value: 12 },
  //         { source: 2, target: 5, value: 13 },
  //         { source: 3, target: 4, value: 22 },
  //         { source: 3, target: 5, value: 23 },
  //     ],
  // };

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
    }

    // then add the gene type nodes
    for (const [sourceID, gene_types] of Object.entries(summary.data.sourceSummary)) {
      for (let [gene_type, transcript_types] of Object.entries(gene_types)) {
        // add gene type node
        if (gene_type === "None"){
          gene_type = "Unknown";
        }
        const gene_type_node = { node: max_id, name: gene_type };
        newSankeyData.nodes.push(gene_type_node);
        gene_type_map[gene_type] = max_id;
        max_id += 1;
      }
    }

    // then add the transcript type nodes
    for (const [sourceID, gene_types] of Object.entries(summary.data.sourceSummary)) {
      for (const [gene_type, transcript_types] of Object.entries(gene_types)) {
        for (const [transcript_type, count] of Object.entries(transcript_types)) {
          // add transcript type node
          if (transcript_type === "None"){
            transcript_type = "Unknown";
          }
          const transcript_type_node = { node: max_id, name: transcript_type };
          newSankeyData.nodes.push(transcript_type_node);
          transcript_type_map[transcript_type] = max_id;
          max_id += 1;
        }
      }
    }

    console.log("new sankey data", newSankeyData);
    setSankeyData(newSankeyData);
  }, [summary.data.sourceSummary]);

  return (
    <div className="custom-container" style={{ overflow: 'auto' }}>
        <div className="custom-header">Combination Settings</div>
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
