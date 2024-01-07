// components/main.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Outlet } from 'react-router-dom';

import { DatabaseState } from '../../features/database/databaseSlice';
import { SettingsState,
         set_status,
         set_assembly,
         set_organism,
         set_attributes,
         set_include_sources } from '../../features/settings/settingsSlice';
import { useGetTxSummarySliceQuery } from '../../features/summary/summaryApi';

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

const main: React.FC = () => {
  const { organismID, assemblyID, sourceIDs } = useParams<{ organismID: string; assemblyID: string, sourceIDs: string }>();

  // sourceIDs is a list of source IDs separated by commas
  // try to build a list of integers if conversion possible - otherwise empty list
  const sourceIDList:number[] = [];
  if (sourceIDs) {
    sourceIDs.split(",").forEach((item) => {
      const itemInt = parseInt(item);
      if (!isNaN(itemInt)) {
        sourceIDList.push(itemInt);
      }
    });
  }

  // when here, need to pre-load all configurations into the settings
  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  // this useEffect only runs if something changes in the src2attr in globalData
  useEffect(() => {
    dispatch(set_organism(parseInt(organismID)));
    dispatch(set_assembly(parseInt(assemblyID)));
    dispatch(set_include_sources(sourceIDList));

    let new_attributes: {[sourceID:number]:{"gene_type":[],"transcript_type":[]}} = {};
    for (const sourceID of sourceIDList) {
      new_attributes[sourceID] = {"gene_type":[],
                                  "transcript_type":[]};
      for (const gene_type of globalData.src2gt[sourceID]) {
        new_attributes[sourceID]["gene_type"].push(gene_type);
      }
      for (const transcript_type of globalData.src2tt[sourceID]) {
        new_attributes[sourceID]["transcript_type"].push(transcript_type);
      }
    }
    dispatch(set_attributes(new_attributes));
    dispatch(set_status("idle"));
  }, [dispatch, globalData.src2attr]);

  return (
    <div className="main">
      <Outlet />
    </div>
  );
};

export default main;
