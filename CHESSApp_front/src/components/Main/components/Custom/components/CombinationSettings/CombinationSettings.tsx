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

const generateRandomData = (): UpsetData => {
    // Logic to generate random data (you can customize this based on your requirements)
    // For simplicity, here's an example with random values.
    const sets = ['A', 'B', 'C', 'D'];
    const intersections = sets.map(set => ({
        set,
        value: Math.floor(Math.random() * 1000),
    }));

    return {
        sets,
        intersections,
    };
};

const CombinationSettings: React.FC<CombinationSettingsProps> = ({ parentWidth, parentHeight }) => {
    
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
        // sets: ['A', 'B', 'C', 'D'],
        // intersections: [
        //     { set: 'A', value: 1000 },
        //     { set: 'B', value: 500 },
        //     { set: 'C', value: 800 },
        //     { set: 'D', value: 300 },
        //     { set: 'A,B', value: 200 },
        //     { set: 'A,C', value: 400 },
        //     { set: 'A,D', value: 100 },
        //     { set: 'B,C', value: 300 },
        //     { set: 'B,D', value: 200 },
        //     { set: 'C,D', value: 100 },
        //     { set: 'A,B,C', value: 100 },
        //     { set: 'A,B,D', value: 100 },
        //     { set: 'A,C,D', value: 0 },
        //     { set: 'B,C,D', value: 100 },
        //     { set: 'A,B,C,D', value: 0 },
        // ],
    
    useEffect(() => {
        // Logic to handle settings update
        // Trigger re-render of the UpsetPlot component with updated settings
        const sets = settings.value.sources_include;
        const set_names = [];
        for (const sourceID of sets) {
            set_names.push(globalData.data.sources[sourceID].name);
        }
        const intersections = [];
        for (const [sourceIDs, attrs] of Object.entries(summary.data)) {
            let total_count = 0;
            for (const [attr, attr_data] of Object.entries(attrs)) {
                for (const [attr_value, count] of Object.entries(attr_data)) {
                    total_count += count;
                }
            }
            intersections.push({ set: sourceIDs, value: total_count });
        }
        setUpsetData({sets,set_names,intersections});
    }, [summary]);

    return (
        <div className="custom-container" style={{ overflow: 'auto' }}>
            <div className="custom-header">Combination Settings</div>
            {summary.status === "loading" ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : summary.status === "succeeded" ? (
                <UpsetPlot data={upsetData} parentWidth={currentParentWidth} parentHeight={currentParentHeight} />
            ) : (
                <div>
                    Error loading summary slice
                </div>
            )}
        </div>
    );
};

export default CombinationSettings;