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
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(set_organism(parseInt(organismID)));
    dispatch(set_assembly(parseInt(assemblyID)));
    dispatch(set_include_sources(sourceIDList));

    const genomeSourceIDs = globalData.ass2src[parseInt(assemblyID)];
    let new_attributes = {};
    for (const [sourceID, attrs] of Object.entries(globalData.src2attr)) {
      if ( sourceID in genomeSourceIDs ) {
        new_attributes[sourceID] = attrs;
      }
    }
    console.log("new_attributes", new_attributes)
    dispatch(set_attributes(new_attributes));
    dispatch(set_status("idle"));
  }, [dispatch, globalData.src2attr]);

  // listen to any changes in the settings and update the summary accordingly
  // coordinate data synchronization with the server whenever settings change
  // whenever settings change - fetch new data
  const settings = useSelector((state: RootState) => state.settings);
  const { data, error, isLoading } = useGetTxSummarySliceQuery(settings);

  return (
    <div className="main">
      <Outlet />
    </div>
  );
};

export default main;
