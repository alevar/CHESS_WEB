// components/main.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Outlet } from 'react-router-dom';

import { DatabaseState } from '../../features/database/databaseSlice';
import { set_assembly, set_organism, set_attributes, set_include_sources } from '../../features/settings/settingsSlice';

interface RootState {
  database: DatabaseState;
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
    dispatch(set_attributes(globalData.src2attr));
  }, [dispatch, globalData.src2attr]);

  return (
    <div className="main">
      <Outlet />
    </div>
  );
};

export default main;
