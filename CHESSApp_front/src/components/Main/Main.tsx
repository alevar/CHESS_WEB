import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Outlet } from 'react-router-dom';
import { RootState } from '../../app/store'; // Adjust the import according to your store's location

import {
  setStatus,
  setAssembly,
  setOrganism,
  setAttributes,
  setIncludeSources,
} from '../../features/settings/settingsSlice';

import './Main.css';

const Main: React.FC = () => {
  const { organismID, assemblyID, sourceIDs } = useParams<{
    organismID: string;
    assemblyID: string;
    sourceIDs: string;
  }>();

  const sourceIDList = useMemo(() => {
    return sourceIDs ? sourceIDs.split(',').map(Number).filter(item => !isNaN(item)) : [];
  }, [sourceIDs]);

  const globalData = useSelector((state: RootState) => state.database.data);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!organismID || !assemblyID || !globalData.ass2src) return;

    const organismIDInt = parseInt(organismID);
    const assemblyIDInt = parseInt(assemblyID);

    dispatch(setOrganism(organismIDInt));
    dispatch(setAssembly(assemblyIDInt));
    dispatch(setIncludeSources(sourceIDList));

    const newAttributes: { [sourceID: number]: { gene_type: number[]; transcript_type: number[] } } = {};
    for (const sourceID of globalData.ass2src[assemblyIDInt] || []) {
      newAttributes[sourceID] = { gene_type: [], transcript_type: [] };
      for (const gene_type of globalData.src2gt[sourceID] || []) {
        newAttributes[sourceID].gene_type.push(gene_type);
      }
      for (const transcript_type of globalData.src2tt[sourceID] || []) {
        newAttributes[sourceID].transcript_type.push(transcript_type);
      }
    }

    dispatch(setAttributes(newAttributes));
    dispatch(setStatus('idle'));
  }, [dispatch, organismID, assemblyID, sourceIDList, globalData]);

  return (
    <div className="main">
      <Outlet />
    </div>
  );
};

export default Main;
