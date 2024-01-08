// SourceSettings.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Button, Accordion, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import HintIcon from '../../../HintIcon/HintIcon';

import { DatabaseState } from '../../../../../../features/database/databaseSlice';
import {
  SettingsState,
  add_source,
  remove_source,
} from '../../../../../../features/settings/settingsSlice';

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

interface SourceSettingsProps {
  buttonStates: Record<string, boolean>;
  onButtonClickProp: (sourceID:number,kvid:number,type:strings) => void;
  activeAccordionKey: string | null;  // New prop for controlling the active accordion key
  onAccordionChange: (key: string | null) => void;  // New prop callback for handling accordion changes
}

function SourceSettings({ buttonStates,
                          onButtonClickProp,
                          activeAccordionKey,
                          onAccordionChange, }: SourceSettingsProps) {
  const globalData = useSelector((state: RootState) => state.database.data);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const onCheckboxChange = (sid, event) => {
    // if checked, add to the list, otherwise remove
    if (event.target.checked) {
      dispatch(add_source(sid));
    } else {
      dispatch(remove_source(sid));
    }

    // Prevent accordion from expanding when the switch is toggled
    onAccordionChange(null);
  };

  const onButtonClick = (sourceID: number, kvid: number, type: string) => {
    onButtonClickProp(sourceID, kvid, type );
  };

  return (
    <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      <div className="container" style={{ height: '80vh', overflowY: 'auto' }}>
        <div style={{ padding: '15px', fontSize: '1.5rem' }}>Source Settings</div>
        <Accordion 
            alwaysOpen 
            activeKey={activeAccordionKey} 
            onSelect={(key) => onAccordionChange(key)} 
            style={{ overflowY: 'auto' }}>
          {globalData?.ass2src[settings.value.genome].map((sourceID, index) => {
            const isSourceIncluded = settings.value.sources_include.includes(Number(sourceID)) === true;

            return (
              <Accordion.Item eventKey={sourceID.toString()} key={sourceID} className={'selected'}>
                <Accordion.Header
                  style={
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
                  <HintIcon sourceData={globalData?.sources[sourceID]} />
                </Accordion.Header>
                <Accordion.Body>
                  {globalData?.src2gt.hasOwnProperty(Number(sourceID)) && globalData?.src2gt[sourceID].length > 1 && (
                    <>
                      <h3>Gene Type</h3>
                      <div>
                        {globalData?.src2gt[sourceID].map((kvid, valueIndex) => (
                          <Button
                            key={kvid}
                            id={`${sourceID}_${kvid}_button`} // Add this line
                            variant={buttonStates[`${"gene_type"}:${sourceID}_${kvid}`] === true ? 'success' : 'secondary'}
                            onClick={() => onButtonClick(Number(sourceID), Number(kvid), 'gene_type')}>
                            {globalData?.attributes[kvid].value}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}

                  {globalData?.src2tt.hasOwnProperty(Number(sourceID)) && globalData?.src2tt[sourceID].length > 1 && (
                    <>
                      <h3>Transcript Type</h3>
                      <div>
                        {globalData?.src2tt[sourceID].map((kvid, valueIndex) => (
                          <Button
                            key={kvid}
                            variant={buttonStates[`${"transcript_type"}:${sourceID}_${kvid}`] === true ? 'success' : 'secondary'}
                            onClick={() => onButtonClick(Number(sourceID), Number(kvid), 'transcript_type')}>
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

export default SourceSettings;
