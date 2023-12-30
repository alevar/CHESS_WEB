// The logic here will be as follows:
// 1. There exists a summary table for transcripts, where each transcript is listed with all attributes for user interface selections
// 2. there is a function which groups these transcripts by the attributes, etc and returns result to the frontend
// 3. frontend uses this data to provide a visual feedback to the user
// 5. dataset information will have to be integrated into this table as well, eventually.
// 6. however we will not need to incorporate it into the result shared with the frontend (at least not in full - maybe summarize by binning?)

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Accordion, Card } from 'react-bootstrap';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState, set_include_sources } from '../../../../features/settings/settingsSlice';
import { UpSetJS, extractCombinations, asCombinations } from '@upsetjs/react';

import { useGetTxSummarySliceQuery } from '../../../../features/database/databaseApi';

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

function SelectSources(props: Props) {
  const { selection, onSelectionChange, onPreviousSlide, prop_className } = props;

  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const { txdata, txerror, txisLoading } = useGetTxSummarySliceQuery(settings.value);

  const [buttonStates, setButtonStates] = useState({});
  const isSelectionMade = Object.values(buttonStates).some((value) => value === true);

  const onButtonClick = (key) => {
    setButtonStates((prevStates) => {
      const newState = !prevStates[key]; // Toggle the state
      return { ...prevStates, [key]: newState };
    });
  };

  const onNextSlide = () => {
    // Gather the selected checkboxes
    const include = Object.entries(buttonStates)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
  
    // Dispatch the selected sources to the store
    dispatch(set_include_sources(include));
  
    // Call the original onNextSlide callback
    props.onNextSlide();
  };

  return (
    <div className={`${prop_className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div className="col-md-6" style={{ flex: '0 0 30%', borderRight: '1px solid #ccc', paddingRight: '15px' }}>
          <div className="container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Accordion>
              {globalData?.ass2src[settings.value.genome].map((sourceID, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>
                    {globalData?.sources[sourceID].name}
                  </Accordion.Header>
                  <Accordion.Body style={{ overflowY: 'auto' }}>
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          checked={buttonStates[sourceID] === true}
                          onChange={() => onButtonClick(sourceID)}
                        />
                        <span>{/* Add a span for styling */}Include this source</span>
                      </label>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {/* Move the button div outside the main container */}
      <div style={{ marginTop: '20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-primary" onClick={onPreviousSlide} disabled={true}>
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

export default SelectSources;