import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Spinner from 'react-bootstrap/Spinner';
import './Custom.css';

import SourceSettings from './components/SourceSettings/SourceSettings';
import SummaryView from './components/SummaryView/SummaryView';
import CombinationSettings from './components/CombinationSettings/CombinationSettings';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState, add_attribute, remove_attribute } from '../../../../features/settings/settingsSlice';
import { SummaryState } from '../../../../features/summary/summarySlice';
import { useGetTxSummarySliceQuery } from '../../../../features/summary/summaryApi';


interface RootState {
    database: DatabaseState;
    settings: SettingsState;
  }
  

const Custom: React.FC = () => {

    // handle resize logic
    const [combinationsPanelSize, setCombinationsPanelSize] = useState<{ width: number; height: number }>({
        width: 30, // replace with the actual default width
        height: 30, // replace with the actual default height
    });

    const handleResize = (id:number,data:number[]) => {
        if (id === 0) {
            setCombinationsPanelSize({ width: data[1], height: combinationsPanelSize.height });
        }
        else if (id === 1) {
            setCombinationsPanelSize({ width: combinationsPanelSize.width, height: data[0] });
        }
    };


    // deal with the summary updates
    const summary_status = useSelector((state: SummaryState) => state.status);
    const summary_data = useSelector((state: SummaryState) => state.data);
    useEffect(() => {
        if (summary_status === "loading") {
            console.log("summary loading")
        }
        if (summary_status === "succeeded") {
            console.log("summary loaded")
        }
    }, [summary_status]);

    const settings = useSelector((state: RootState) => state.settings);
    const [buttonStates, setButtonStates] = useState({});

    const initialButtonStatesSet = useRef(false);
    const dispatch = useDispatch();
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
        initialButtonStatesSet.current = true;
      }
    }, [settings.value.attributes]);

    const handleButtonClick = (sourceID:number,kvid:number,type:string) => {
        setButtonStates((prevStates) => {
            const buttonKey = `${type}:${sourceID}_${kvid}`;
            const newState = !prevStates[buttonKey];
            console.log("button clicked",sourceID,kvid,type,newState,prevStates)
            if (newState) {
                dispatch(add_attribute([type,sourceID,kvid]));
            } else {
                dispatch(remove_attribute([type,sourceID,kvid]));
            }
            return { ...prevStates, [buttonKey]: newState };
        });
    };

    // listen to any changes in the settings and update the summary accordingly
    // coordinate data synchronization with the server whenever settings change
    // whenever settings change - fetch new data
    const { data, error, isLoading } = useGetTxSummarySliceQuery(settings);


    // accordion item listeners
    const [activeAccordionKey, setActiveAccordionKey] = useState<string | null>(null);
    const handleAccordionChange = (key: string | null) => {
        // You can perform any additional logic here before updating the state
        setActiveAccordionKey(key);
    };

    return (
        <div className="custom-wrapper">
            <PanelGroup direction="horizontal" onLayout={(newSize) => handleResize(0,newSize)}>
                <Panel id="sources_panel" defaultSize={30} minSize={10}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        {/* Add the following style to the body to prevent scrolling */}
                        <style>{`body { overflow: hidden; }`}</style>
                        <SourceSettings 
                            buttonStates={buttonStates} 
                            onButtonClickProp={handleButtonClick}
                            activeAccordionKey={activeAccordionKey}
                            onAccordionChange={handleAccordionChange}/>
                    </div>
                </Panel>
                <PanelResizeHandle className="PanelResizeHandle PanelResizeHandleVertical" />
                <Panel id="central_panel" minSize={50}>
                    <PanelGroup direction="vertical" onLayout={(newSize) => handleResize(1,newSize)}>
                        <Panel id="combinations_panel" defaultSize={30} minSize={20}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                <style>{`body { overflow: hidden; }`}</style>
                                <CombinationSettings parentWidth={combinationsPanelSize.width} parentHeight={combinationsPanelSize.height} />
                            </div>
                        </Panel>
                        <PanelResizeHandle className="PanelResizeHandle PanelResizeHandleHorizontal" />
                        <Panel id="summary_panel" defaultSize={70} minSize={20}>
                            <SummaryView />
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default Custom;
