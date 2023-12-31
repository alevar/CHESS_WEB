// The logic here will be as follows:
// 1. There exists a summary table for transcripts, where each transcript is listed with all attributes for user interface selections
// 2. there is a function which groups these transcripts by the attributes, etc and returns result to the frontend
// 3. frontend uses this data to provide a visual feedback to the user
// 5. dataset information will have to be integrated into this table as well, eventually.
// 6. however we will not need to incorporate it into the result shared with the frontend (at least not in full - maybe summarize by binning?)

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Accordion, Card, Form, Switch, } from 'react-bootstrap';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState, set_include_sources, add_source, remove_source } from '../../../../features/settings/settingsSlice';
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

  const [activeAccordionKey, setActiveAccordionKey] = useState(null);

  const onCheckboxChange = (sid, event) => {
    // if checked, add to the list, otherwise remove
    if (event.target.checked) {
      dispatch(add_source(sid));
    } else {
      dispatch(remove_source(sid));
    }

    // Prevent accordion from expanding when the switch is toggled
    setActiveAccordionKey(null);
  };

  const onButtonClick = (sourceID,kvid) => {
    setButtonStates((prevStates) => {
      const newState = !prevStates[kvid]; // Toggle the state
      return { ...prevStates, [kvid]: newState };
    });
  };

  const onNextSlide = () => {
    // Call the original onNextSlide callback
    props.onNextSlide();
  };

  const [color, setColor] = useState('red');

  return (
    <div className={`${prop_className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div className="col-md-6" style={{ flex: '0 0 30%', borderRight: '1px solid #ccc', paddingRight: '15px' }}>
          <div className="container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Accordion activeKey={activeAccordionKey} onSelect={(key) => setActiveAccordionKey(key)} style={{ overflowY: 'auto' }}>
              {globalData?.ass2src[settings.value.genome].map((sourceID, index) => {
                const isSourceIncluded = settings.value.sources_include.includes(Number(sourceID)) === true;
                const src2attrData = globalData?.src2attr[sourceID];

                return (
                  <Accordion.Item eventKey={sourceID.toString()} key={sourceID} className={'selected'}>
                    <Accordion.Header style={
                      isSourceIncluded
                        ? {
                            '--bs-accordion-active-bg': '#45b08c',
                            '--bs-accordion-btn-bg': '#45b08c',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }
                        : { backgroundColor: 'inherit' }
                    }>
                      <span>{globalData?.sources[sourceID].name}</span>
                      <div className="ml-auto">
                        <Form.Check
                          type="switch"
                          id={`switch-${sourceID}`}
                          checked={isSourceIncluded}
                          onChange={(event) => onCheckboxChange(Number(sourceID), event)}
                          label=""
                          style={{ marginTop: 'auto', marginBottom: 'auto' }} // Align switch to the right
                        />
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <h3>Gene Type</h3>
                      <div>

                      </div>
                      <h3>Transcript Type</h3>
                      <div>
                        
                      </div>
                      <h3>Include Pseudogenes</h3>
                      <div>
                        <Form.Check
                          type="switch"
                          id={`switch-${sourceID}`}
                          checked={isSourceIncluded}
                          onChange={(event) => onCheckboxChange(Number(sourceID), event)}
                          label=""
                          style={{ marginTop: 'auto', marginBottom: 'auto' }} // Align switch to the right
                        />
                      </div>
                      {src2attrData && Object.keys(src2attrData).map((attrKey) => (
                        <div key={attrKey} style={{ marginBottom: '15px' }}>
                          <h3>{attrKey}</h3>
                          <div className="button-group">
                            {src2attrData[attrKey].map((kvid, valueIndex) => (
                              <Button
                                key={kvid}
                                variant={buttonStates[kvid] === true ? 'success' : 'secondary'}
                                onClick={() => onButtonClick(sourceID, kvid)}
                              >
                                {globalData?.attributes[kvid].value}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </div>
        </div>
      </div>

      {/* ... other stuff */}
    </div>
  );
}

export default SelectSources;