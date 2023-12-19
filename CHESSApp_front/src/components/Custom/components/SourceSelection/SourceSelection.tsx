import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { extractCombinations, UpSetJS } from '@upsetjs/react';

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
  const elems = useMemo(
    () => [
      { name: 'A', sets: ['S1', 'S2'] },
      { name: 'B', sets: ['S1'] },
      { name: 'C', sets: ['S2'] },
      { name: 'D', sets: ['S1', 'S3'] },
    ],
    []
  );
  
  const { sets, combinations } = useMemo(() => extractCombinations(elems), [elems]);

  const { selection, onSelectionChange, onPreviousSlide, prop_className } = props;

  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const [buttonStates, setButtonStates] = useState({});
  const isSelectionMade = Object.values(buttonStates).some((value) => value === true);

  const onButtonClick = (key) => {
    setButtonStates((prevStates) => {
      const newState = prevStates[key] === true ? false : (prevStates[key] === false ? null : true);
      return { ...prevStates, [key]: newState };
    });
  };

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
        <div className="container">
        <div className="row">
          {Object.entries(globalData?.sources[settings.value.genome]).map(([key, value], index) => (
            <div key={index} className="col-sm-4" style={{ marginBottom: '10px' }}>
              <Button
                variant={buttonStates[key] === true ? 'success' : (buttonStates[key] === false ? 'danger' : 'secondary')}
                onClick={() => onButtonClick(key)}
                style={{ marginRight: '10px', width: '100%', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {key}
              </Button>
            </div>
          ))}
        </div>
      </div>
        </div>
        <div className="col-md-6 pl-md-5">
        <UpSetJS
          sets={sets}
          combinations={combinations}
          width={500}
          height={300}
        />
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

export default SelectOrganism;