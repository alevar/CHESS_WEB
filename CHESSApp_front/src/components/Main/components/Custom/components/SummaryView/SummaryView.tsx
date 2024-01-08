import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import HintIcon from '../../../../../HintIcon/HintIcon';
import { Spinner } from 'react-bootstrap';

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
  useEffect(() => {
    console.log("summaryView",summary.data)
  }, [summary.data]);

  return (
    <div className="custom-container" style={{ overflow: 'auto' }}>
        <div className="custom-header">Combination Settings</div>
        {summary.status === "loading" ? (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        ) : summary.status === "succeeded" ? (
            "test"
        ) : (
            <div>
                Error loading summary slice
            </div>
        )}
    </div>
  );
};

export default SummaryView;
