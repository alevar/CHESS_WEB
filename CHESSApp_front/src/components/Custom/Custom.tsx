import React from 'react';

import SourceSettings from './components/SourceSettings/SourceSettings';
import SummaryView from './components/SummaryView/SummaryView';
import DataSettings from './components/DataSettings/DataSettings';

import { DatabaseState } from '../../features/database/databaseSlice';
import { SettingsState } from '../../features/settings/settingsSlice';
import './Custom.css';

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

function Custom() {
  return (
    <div className="custom-wrapper" id="test">
      <div className="custom-row">
        <div className="custom-sourceSettingsColumn">
          <div className="custom-container">
            <SourceSettings />
          </div>
        </div>

        <div className="custom-summaryColumn">
          <div className="custom-container">
            <SummaryView />
          </div>
        </div>

        <div className="custom-evidenceSettingsColumn">
          <div className="custom-container">
            <DataSettings />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Custom;
