import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState, set_select_sources } from '../../../../features/settings/settingsSlice';

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

interface Props {
  selection: string;
  onSelectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  prop_className?: string;
}

function SelectOrganism(props: Props) {
  const { selection, onSelectionChange, onPreviousSlide, prop_className } = props;

  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const isSelectionMade = Object.values(selection).some((value) => value);

  const onNextSlide = () => {
    // Gather the selected checkboxes
    const selectedSources = Object.entries(selection)
      .filter(([key, value]) => value)
      .map(([key]) => key);

    // Dispatch the selected sources to the store
    dispatch(set_select_sources(selectedSources));

    // Call the original onNextSlide callback
    props.onNextSlide();
  };

  return (
    <div className={`${prop_className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div className="col-md-6" style={{ borderRight: '1px solid #ccc', paddingRight: '15px' }}>
          {Object.entries(globalData?.sources[settings.value.genome]).map(([key, value], index) => (
            <div className="form-check" key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                className="form-check-input"
                type="checkbox"
                name={key}
                value={key}
                onChange={onSelectionChange}
                style={{ marginRight: '10px' }}
              />
              <label className="form-check-label" style={{ marginRight: '20px' }}>
                {key}
              </label>
            </div>
          ))}
        </div>
        <div className="col-md-6 pl-md-5">
          <p>Some general text goes here.</p>
        </div>
      </div>

      {/* Move the button div outside the main container */}
      <div style={{ marginTop: '20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-primary" onClick={onPreviousSlide}>
            Previous
          </button>
          <button className="btn btn-primary" onClick={onNextSlide} disabled={!isSelectionMade}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectOrganism;