import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DownloadButton from '../../../DownloadButton/DownloadButton';

import SourceSettings from './components/SourceSettings/SourceSettings';
import SummaryView from './components/SummaryView/SummaryView';
import CombinationSettings from './components/CombinationSettings/CombinationSettings';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import {
    SettingsState,
    add_attribute,
    remove_attribute,
    add_source_intersection,
    remove_source_intersection
} from '../../../../features/settings/settingsSlice';
import { SummaryState } from '../../../../features/summary/summarySlice';
import { useGetTxSummarySliceQuery } from '../../../../features/summary/summaryApi';

import './Custom.css';

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
}

const Custom: React.FC = () => {

    const default_panel_dims = {
        settings_panel: { width: 30, height: 90 },
        download_panel: { width: 30, height: 10 },
        combinations_panel: { width: 70, height: 30 },
        summary_panel: { width: 70, height: 70 }
    }

    // handle resize logic
    const [customPageSize, setCustomPageSize] = useState<{ width: number; height: number }>({}); // size of the entire page
    const [combinationsPanelSize, setCombinationsPanelSize] = useState<{ width: number; height: number }>({});
    const [summaryViewPanelSize, setSummaryViewPanelSize] = useState<{ width: number; height: number }>({});


    // Load page sizing when the page loads
    // panels only report percent of the panelGroup
    // we need the size of the parent div to get the pixel values for the components
    const customPageRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!customPageRef.current) return;
        setCustomPageSize({width: customPageRef.current.clientWidth, height: customPageRef.current.clientHeight});

        const combPanel_width = customPageRef.current.clientWidth * (default_panel_dims.combinations_panel.width / 100);
        const summaryPanel_width = customPageRef.current.clientWidth * (default_panel_dims.summary_panel.width / 100);
        const combPanel_height = customPageRef.current.clientHeight * (default_panel_dims.combinations_panel.height / 100);
        const summaryPanel_height = customPageRef.current.clientHeight * (default_panel_dims.summary_panel.height / 100);

        setCombinationsPanelSize({ width: combPanel_width, height: combPanel_height });
        setSummaryViewPanelSize({ width: summaryPanel_width, height: summaryPanel_height });
    }, [customPageRef.current]);

    const handleResize = (id: number, data: number[]) => {
        if (id === 0) {
            const combPanel_width = customPageSize.width * (data[1] / 100);
            const summaryPanel_width = customPageSize.width * (data[1] / 100);
            setCombinationsPanelSize({ width: combPanel_width, height: combinationsPanelSize.height });
            setSummaryViewPanelSize({ width: summaryPanel_width, height: summaryViewPanelSize.height });
        }
        else if (id === 1) {
            const combPanel_height = customPageSize.height * (data[0] / 100);
            const summaryPanel_height = customPageSize.height * ((100 - data[0]) / 100);
            setCombinationsPanelSize({ width: combinationsPanelSize.width, height: combPanel_height });
            setSummaryViewPanelSize({ width: summaryViewPanelSize.width, height: summaryPanel_height });
        }
    };

    const settings = useSelector((state: RootState) => state.settings);
    const [buttonStates, setButtonStates] = useState({});

    const dispatch = useDispatch();
    const initialButtonStatesSet = useRef(false);
    useEffect(() => {
        // Set initial button states only once when the component mounts
        if (!initialButtonStatesSet.current && settings.status === "idle") { // only run when all settings have been loaded
            const initialButtonStates = {};
            for (const [sourceID, attrs] of Object.entries(settings.value.attributes)) {
                for (const [key, values] of Object.entries(attrs)) {
                    for (const kvid of values) {
                        const buttonKey = `${key}:${sourceID}_${kvid}`;
                        initialButtonStates[buttonKey] = true;
                    }
                }
            }
            setButtonStates(initialButtonStates);
            initialButtonStatesSet.current = true;
        }
    }, [settings.value.attributes]);

    const handleButtonClick = (sourceID: number, kvid: number, type: string) => {
        setButtonStates((prevStates) => {
            const buttonKey = `${type}:${sourceID}_${kvid}`;
            const newState = !prevStates[buttonKey];
            if (newState) {
                dispatch(add_attribute([type, sourceID, kvid]));
            } else {
                dispatch(remove_attribute([type, sourceID, kvid]));
            }
            return { ...prevStates, [buttonKey]: newState };
        });
    };

    // listen to any changes in the settings and update the summary accordingly
    // coordinate data synchronization with the server whenever settings change
    // whenever settings change - fetch new data
    const { data, error, isLoading, refetch } = useGetTxSummarySliceQuery(settings.value);
    useEffect(() => {
        // Fetch new data whenever settings change
        const fetchData = async () => {
            try {
                await refetch();
            } catch (error) {
                // Handle error appropriately
            }
        };
        fetchData();
    }, [settings.value, refetch]);


    // accordion item listeners
    const [activeAccordionKey, setActiveAccordionKey] = useState<string | null>(null);
    const handleAccordionChange = (key: string | null) => {
        // You can perform any additional logic here before updating the state
        setActiveAccordionKey(key);
    };


    // UpsetPlot selection listeners
    const [selectedIntersections, setSelectedIntersections] = useState<number[]>([]);
    const handleIntersectionClick = (ixData: { set: any, intersection: any, index: number }) => {
        const ix_source_list = ixData.intersection.set.split(',').map(Number).sort((a, b) => a - b);
        // toggle selections and dispatch actions to update settings
        setSelectedIntersections((prevSelectedIntersections) => {
            if (prevSelectedIntersections.includes(ixData.index)) {
                // update settings
                dispatch(remove_source_intersection(ix_source_list));
                // Remove the index if already selected
                return prevSelectedIntersections.filter((index) => index !== ixData.index);
            } else {
                // update settings
                dispatch(add_source_intersection(ix_source_list));
                // Add the index if not selected
                return [...prevSelectedIntersections, ixData.index];
            }
        });
    };

    return (
        <div ref={customPageRef} className="custom-wrapper">
            <PanelGroup direction="horizontal" onLayout={(newSize) => handleResize(0,newSize)}>
                <Panel id="side_panel" defaultSize={default_panel_dims.settings_panel.width} minSize={10}>
                    <PanelGroup direction="vertical" onLayout={(newSize) => handleResize(1,newSize)}>
                        <Panel id="sources_panel" defaultSize={default_panel_dims.settings_panel.width} minSize={90}>
                            <div>
                                <style>{`body { overflow: hidden; }`}</style>
                                <SourceSettings 
                                    buttonStates={buttonStates} 
                                    onButtonClickProp={handleButtonClick}
                                    activeAccordionKey={activeAccordionKey}
                                    onAccordionChange={handleAccordionChange}/>
                            </div>
                        </Panel>
                        <hr className="custom-hr"/>
                        <Panel id="download" defaultSize={default_panel_dims.download_panel.width} minSize={10}>
                            <div>
                                <DownloadButton/>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
                <PanelResizeHandle className="PanelResizeHandle PanelResizeHandleVertical" />
                <Panel id="central_panel" defaultSize={100-default_panel_dims.settings_panel.width} minSize={50}>
                    <PanelGroup direction="vertical" onLayout={(newSize) => handleResize(1,newSize)}>
                        <Panel id="combinations_panel" defaultSize={default_panel_dims.combinations_panel.height} minSize={20}>
                            <div>
                                <style>{`body { overflow: hidden; }`}</style>
                                <CombinationSettings 
                                    selectedIntersections={selectedIntersections}
                                    onIntersectionClick={handleIntersectionClick}
                                    parentWidth={combinationsPanelSize.width} 
                                    parentHeight={combinationsPanelSize.height} />
                            </div>
                        </Panel>
                        <PanelResizeHandle className="PanelResizeHandle PanelResizeHandleHorizontal" />
                        <Panel id="summary_panel" defaultSize={default_panel_dims.summary_panel.height} minSize={20}>
                            <div>
                                <SummaryView 
                                    parentWidth={summaryViewPanelSize.width} 
                                    parentHeight={summaryViewPanelSize.height} />
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default Custom;
