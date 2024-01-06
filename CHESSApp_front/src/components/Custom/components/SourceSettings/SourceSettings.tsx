import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Accordion, Form, } from 'react-bootstrap';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState, set_include_sources, add_source, remove_source, add_attribute, remove_attribute } from '../../../../features/settings/settingsSlice';

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

function SelectSources() {
  
    const globalData = useSelector((state: RootState) => state.database.data);
    const settings = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch();
  
    const [buttonStates, setButtonStates] = useState({});
    const isSelectionMade = Object.values(buttonStates).some((value) => value === true);
  
    const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  
    // Set initial button states - done to make sure all states are set
    const initialButtonStatesSet = useRef(false);
    useEffect(() => {
      // Set initial button states only once when the component mounts
      if (!initialButtonStatesSet.current) {
        const initialButtonStates = {};
        for (const [sourceID,attrs] of Object.entries(settings.value.attributes)) {
          for (const [key,values] of Object.entries(attrs)) {
            for (const kvid of values) {
                const buttonKey = `${sourceID}_${kvid}`;
                initialButtonStates[buttonKey] = true;
            }
          }
        }
        setButtonStates(initialButtonStates);
    
        // Update the ref to prevent future runs of useEffect
        initialButtonStatesSet.current = true;
      }
    }, [settings.value.attributes]);
  
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
  
    const onButtonClick = (sourceID:number,kvid:number) => {
      setButtonStates((prevStates) => {
        const buttonKey = `${sourceID}_${kvid}`;
        const newState = !prevStates[buttonKey];
        if (newState) {
          dispatch(add_attribute([sourceID,kvid]));
        } else {
          dispatch(remove_attribute([sourceID,kvid]));
        }
        return { ...prevStates, [kvid]: newState };
      });
    };
  
    return (  
        <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <div className="container" style={{ height: '80vh', overflowY: 'auto' }}>
            <div style={{ padding: '15px', fontSize: '1.5rem' }}>Source Settings</div>
              <Accordion alwaysOpen activeKey={activeAccordionKey} onSelect={(key) => setActiveAccordionKey(key)} style={{ overflowY: 'auto' }}>
                {globalData?.ass2src[settings.value.genome].map((sourceID, index) => {
                  const isSourceIncluded = settings.value.sources_include.includes(Number(sourceID)) === true;
  
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
                            style={{ marginTop: 'auto', marginBottom: 'auto' }}
                          />
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                      {globalData?.src2gt.hasOwnProperty(Number(sourceID)) && 
                        globalData?.src2gt[sourceID].length > 1 && (
                        <>
                          <h3>Gene Type</h3>
                          <div>
                            {globalData?.src2gt[sourceID].map((kvid, valueIndex) => (
                              <Button
                                key={kvid}
                                variant={buttonStates[`${sourceID}_${kvid}`] === true ? 'success' : 'secondary'}
                                onClick={() => onButtonClick(sourceID, kvid)}
                              >
                                {globalData?.attributes[kvid].value}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
  
                      {globalData?.src2tt.hasOwnProperty(Number(sourceID)) && 
                        globalData?.src2tt[sourceID].length > 1 && (
                        <>
                          <h3>Transcript Type</h3>
                          <div>
                            {globalData?.src2tt[sourceID].map((kvid, valueIndex) => (
                              <Button
                                key={kvid}
                                variant={buttonStates[`${sourceID}_${kvid}`] === true ? 'success' : 'secondary'}
                                onClick={() => onButtonClick(sourceID, kvid)}
                              >
                                {globalData?.attributes[kvid].value}
                              </Button>
                            ))}
                          </div>
                        </>
                      )}
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            </div>
          </div>
    );
  }
  
  export default SelectSources;