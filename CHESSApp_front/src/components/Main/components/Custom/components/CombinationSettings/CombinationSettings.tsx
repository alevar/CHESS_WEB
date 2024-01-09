import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import UpsetPlot from './components/UpsetPlot/UpsetPlot';
import Spinner from 'react-bootstrap/Spinner';

import { DatabaseState } from '../../../../../../features/database/databaseSlice';
import { SettingsState } from '../../../../../../features/settings/settingsSlice';
import { SummaryState } from '../../../../../../features/summary/summarySlice';
import { useGetTxSummarySliceQuery } from '../../../../../../features/summary/summaryApi';

import "../../Custom.css"

interface CombinationSettingsProps {
    selectedIntersections: number[];
    onIntersectionClick: (ixData: {set:any,intersection:any,index:number}) => void;
    parentWidth: number;
    parentHeight: number;
}

interface UpsetData {
    sets: string[];
    intersections: { set: string; value: number }[];
}

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
    summary: SummaryState;
}

const CombinationSettings: React.FC<CombinationSettingsProps> = ({ selectedIntersections,
                                                                   onIntersectionClick,
                                                                   parentWidth, 
                                                                   parentHeight }) => {
    
    // Update local state when props change
    const [currentParentWidth, setCurrentParentWidth] = useState<number>(parentWidth);
    const [currentParentHeight, setCurrentParentHeight] = useState<number>(parentHeight);
    useEffect(() => {
        setCurrentParentWidth(parentWidth);
        setCurrentParentHeight(parentHeight);
    }, [parentWidth, parentHeight]);

    // deal with updating component in response to the changes in settings
    const summary = useSelector((state: RootState) => state.summary);
    const settings = useSelector((state: RootState) => state.settings);
    const globalData = useSelector((state: RootState) => state.database);
    const [upsetData, setUpsetData] = useState({});
    
    useEffect(() => {
        // Logic to handle settings update
        // Trigger re-render of the UpsetPlot component with updated settings
        const sets = {};
        for (const sourceID of settings.value.sources_include) {
            sets[sourceID] = globalData.data.sources[sourceID].name;
        }
        const intersections = [];
        for (const [sourceIDs, attrs] of Object.entries(summary.data.upsetSummary)) {
            let total_count = 0;
            for (const [attr, count] of Object.entries(attrs["transcript_type"])) {
                total_count += count;
            }
            intersections.push({ set: sourceIDs, value: total_count });
        }
        setUpsetData({sets,intersections});
    }, [summary]);

    return (
        <div className="custom-container" style={{ overflow: 'auto' }}>
            <div className="custom-header">Combination Settings</div>
            {summary.status === "loading" ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : summary.status === "succeeded" ? (
                <UpsetPlot 
                    data={upsetData} 
                    selectedIntersections={selectedIntersections}
                    onIntersectionClick={onIntersectionClick}
                    parentWidth={currentParentWidth} 
                    parentHeight={currentParentHeight} />
            ) : (
                <div>
                    Error loading summary slice
                </div>
            )}
        </div>
    );
};

export default CombinationSettings;