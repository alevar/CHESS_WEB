// The logic here will be as follows:
// 1. There exists a summary table for transcripts, where each transcript is listed with all attributes for user interface selections
// 2. there is a function which groups these transcripts by the attributes, etc and returns result to the frontend
// 3. frontend uses this data to provide a visual feedback to the user
// 5. dataset information will have to be integrated into this table as well, eventually.
// 6. however we will not need to incorporate it into the result shared with the frontend (at least not in full - maybe summarize by binning?)

import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState, setIncludeSources, setExcludeSources } from '../../../../features/settings/settingsSlice';
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

  // // UpSetJS stuff
  // let upset_data = []
  // let selected_sources = []
  // for (const [key, value] of Object.entries(globalData?.upset[settings.value.species][settings.value.genome])) {
  //   upset_data.push([key.split(';'),value]);
  //   for (const name of key.split(';')) {
  //     if (!selected_sources.includes(name)) {
  //       selected_sources.push(name);
  //     }
  //   }
  // }

  // function areArraysEqual(array1: string[], array2: string[]): boolean {
  //   return array1.length === array2.length && array1.every((value) => array2.includes(value));
  // }
  
  // function processUpsetData(upset_data: UpsetData[], selected_sources: string[]): UpsetData[] {
  //   const results: UpsetData[] = [];
  
  //   upset_data.forEach((data) => {
  //     const commonNames = data[0].filter((name) => selected_sources.includes(name));
  
  //     if (commonNames.length > 0) {
  //       const existingResult = results.find((result) =>
  //         areArraysEqual(result[0], commonNames)
  //       );
  
  //       if (existingResult) {
  //         // If the combination exists, update the count
  //         existingResult[1] += data[1];
  //       } else {
  //         // If the combination doesn't exist, add a new entry to results
  //         results.push([
  //           commonNames,
  //           data[1],
  //         ]);
  //       }
  //     }
  //   });
    
  //   return results;
  // }

  // // now build elements from this data
  // function buildElements(data: UpsetData[]): any[] {
  //   let elements: any[] = [];
  //   let cardinalities = [];
  //   let iname = 0;
  //   data.forEach((data) => {
  //     elements.push({ name: String(iname), sets: data[0] });
  //     cardinalities.push(data[1]);
  //     iname++;
  //   });
  //   return [elements,cardinalities];
  // }

  const [sets, setSets] = useState([]);
  const [combinations, setCombinations] = useState([]);

  const onButtonClick = (key) => {
    setButtonStates((prevStates) => {
      const newState = !prevStates[key]; // Toggle the state
      return { ...prevStates, [key]: newState };
    });
  };

  const onButtonClickUpdateUpset = (key) => {
    // get all elements from buttonStates where value is true
    let selected_sources = []
    let found_key = false;
    for (const [okey, value] of Object.entries(buttonStates)) {
      if (key === okey) { 
        found_key = true;
        if (value === true) {// key was already set and is now being unset
          continue;
        }
        else{
          selected_sources.push(okey);
        }
      }
      else{
        if (value === true) {
          selected_sources.push(okey);
        }
      }
    }
    if (!found_key){
      selected_sources.push(key);
    }

    // // update selected upset data
    // let subset_data = processUpsetData(upset_data, selected_sources);
    // subset_data = subset_data.filter((data) => data[1] > 0);
    // // build elements
    // let [elems, combination_cardinalities] = buildElements(subset_data);

    // const { sets: newSets, combinations: newCombinations } = extractCombinations(elems);
    // for (let i=0; i<newCombinations.length; i++) {
    //   newCombinations[i].cardinality = combination_cardinalities[i];
    // }
    // for (let i=0; i<newSets.length; i++) {
    //   newSets[i].cardinality = globalData?.summary[settings.value.species][settings.value.genome][newSets[i].name]?.totalTranscripts;
    // }

    // // remove any combinations that have cardinality 0. modify existing newCOmbinations
    // let newCombinations_nonempty = [];
    // for (let i=0; i<newCombinations.length; i++) {
    //   if (newCombinations[i].cardinality > 0) {
    //     newCombinations_nonempty.push(newCombinations[i]);
    //   }
    // }

    // setSets(newSets);
    // setCombinations(newCombinations_nonempty);
  }

  const onNextSlide = () => {
    // Gather the selected checkboxes
    const include = Object.entries(buttonStates)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
  
    // Dispatch the selected sources to the store
    dispatch(setIncludeSources(include));
  
    // Call the original onNextSlide callback
    props.onNextSlide();
  };

  return (
    <div className={`${prop_className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div className="col-md-6" style={{ borderRight: '1px solid #ccc', paddingRight: '15px' }}>
        <div className="container">
        <div className="row">
          {globalData?.ass2src[settings.value.genome].map((sourceID, index) => (
            <div key={index} className="col-sm-4" style={{ marginBottom: '10px' }}>
              <Button
                variant={buttonStates[sourceID] === true ? 'success' : 'secondary'}
                onClick={() => {
                  onButtonClick(sourceID);
                  onButtonClickUpdateUpset(sourceID );
                }}
                style={{ marginRight: '10px', width: '100%', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {globalData?.sources[sourceID].name}
              </Button>
            </div>
          ))}
        </div>
      </div>
        </div>
        <div className="col-md-6 pl-md-5">
        {/* <UpSetJS
          sets={sets}
          combinations={combinations}
          width={600}
          height={300}
        /> */}
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