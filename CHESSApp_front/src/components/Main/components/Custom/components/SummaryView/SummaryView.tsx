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

interface SankeyNode {
  node: number;
  name: string;
}
interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

function groupLinks(arr: SankeyLink[]): SankeyLink[] {
  const source_target_map = {};
  for (const link of arr) {
    const source_target = link.source + "_" + link.target;
    if (source_target in source_target_map) {
      source_target_map[source_target]["value"] += link.value;
    }
    else {
      source_target_map[source_target] = { source: link.source, target: link.target, value: link.value };
    }
  }

  return Object.values(source_target_map);
}

function buildSankeyData(data: any, globalData: any, settings:any, threshold:number): { nodes: SankeyNode[], links: SankeyLink[] } {
  let maxId = 0;
  const sourceMap: { [key: string]: number } = {};
  const geneTypeMap: { [key: string]: number } = {};
  const transcriptTypeMap: { [key: string]: number } = {};

  const sankeyData: { nodes: SankeyNode[], links: SankeyLink[] } = { nodes: [], links: [] };

  function addNode(name: string, map: { [key: string]: number }): number {
    if (!(name in map)) {
      const nodeId = maxId++;
      map[name] = nodeId;
      sankeyData.nodes.push({ node: nodeId, name });
      return nodeId;
    }
    return map[name];
  }

  function addLink(sourceId: number, targetId: number, value: number): void {
    sankeyData.links.push({ source: sourceId, target: targetId, value });
  }

  // Add source nodes and build initial structure
  for (const [sourceCombination, sources] of Object.entries(data)) {
    // skip combinations which are not in the source_intersections setting
    if ((settings.value.source_intersections.length>0) && !(settings.value.source_intersections.includes(sourceCombination))) {
      continue;
    }
    for (const [sourceID, geneTypes ] of Object.entries(sources)) {
      const sourceNode = { node: addNode(globalData.data.sources[sourceID].name, sourceMap), name: globalData.data.sources[sourceID].name };

      for (const [geneType, transcriptTypes] of Object.entries(geneTypes)) {
        let geneTypeName = (geneType === "None" || geneType === "") ? "Unknown" : globalData.data.gene_types[geneType].value;
        const transcriptCount = getTotalTranscripts(transcriptTypes);

        if (transcriptCount < threshold) {
          geneTypeName = "Other";
        }

        const geneTypeNode = { node: addNode(geneTypeName, geneTypeMap), name: geneTypeName };

        // Add link from source to gene type
        addLink(sourceNode.node, geneTypeNode.node, transcriptCount);

        for (const [transcriptType, count] of Object.entries(transcriptTypes)) {
          let transcriptTypeName = (transcriptType === "None" || transcriptType === "") ? "Unknown" : globalData.data.transcript_types[transcriptType].value;
          
          if (count < threshold) {
            transcriptTypeName = "Other";
          }
          
          const transcriptTypeNode = { node: addNode(transcriptTypeName, transcriptTypeMap), name: transcriptTypeName };

          // Add link from gene type to transcript type
          addLink(geneTypeNode.node, transcriptTypeNode.node, count);
        }
      }
    }
  }

  // Group links together
  sankeyData.links = groupLinks(sankeyData.links);

  return sankeyData;
}

function getTotalTranscripts(transcriptTypes: { [key: string]: number }): number {
  return Object.values(transcriptTypes).reduce((total, count) => total + count, 0);
}

const SummaryView: React.FC<SummaryViewProps> = ({ parentWidth, parentHeight }) => {
  const globalData = useSelector((state: RootState) => state.database);
  const settings = useSelector((state: RootState) => state.settings);
  const summary = useSelector((state: RootState) => state.summary);

  // process summary data to extract the data for the current view
  const [sankeyData, setSankeyData] = useState({});
  useEffect(() => {
    const sankeyData = buildSankeyData(summary.data.summary,globalData,settings,100);

    setSankeyData(sankeyData);
  }, [summary.data.summary, settings.value.source_intersections]);

  return (
    <div className="summary-container" style={{ overflow: 'auto' }}>
      {summary.status === "loading" ? (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      ) : summary.status === "succeeded" ? (
        <div style={{ width: parentWidth, height:parentHeight, overflow: 'scroll' }}>
          <SankeyPlot data={sankeyData} parentWidth={parentWidth} parentHeight={parentHeight} />
          <div>
            {/* Any additional info goes into this scrollable container */}
          </div>
        </div>
      ) : (
        <div>
          Error loading summary slice
        </div>
      )}
    </div>
  );
};

export default SummaryView;
