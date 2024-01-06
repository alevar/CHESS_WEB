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

interface SampleData {
    sets: string[];
    intersections: { set: string; value: number }[];
}

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
    summary: SummaryState;
}

const generateRandomData = (): SampleData => {
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
    const [settings, setSettings] = useState<SampleData>({
        sets: ['A', 'B', 'C', 'D'],
        intersections: [
            { set: 'A', value: 1000 },
            { set: 'B', value: 500 },
            { set: 'C', value: 800 },
            { set: 'D', value: 300 },
            { set: 'A,B', value: 200 },
            { set: 'A,C', value: 400 },
            { set: 'A,D', value: 100 },
            { set: 'B,C', value: 300 },
            { set: 'B,D', value: 200 },
            { set: 'C,D', value: 100 },
            { set: 'A,B,C', value: 100 },
            { set: 'A,B,D', value: 100 },
            { set: 'A,C,D', value: 0 },
            { set: 'B,C,D', value: 100 },
            { set: 'A,B,C,D', value: 0 },
        ],
    });
    
    useEffect(() => {
        // Logic to handle settings update
        console.log("test");
        // Trigger re-render of the UpsetPlot component with updated settings
    }, [settings]);

    const updateSettings = (newSettings: SampleData) => {
        setSettings(newSettings);
    };

    const handleGenerateRandomData = () => {
        const newRandomData = generateRandomData();
        updateSettings(newRandomData);
    };

    const summary = useSelector((state: RootState) => state.summary);

    return (
        <div className="custom-container" style={{ overflowY: 'auto', overflowX: 'auto' }}>
            <div className="custom-header">Combination Settings</div>
            {summary.status === "loading" ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : summary.status === "succeeded" ? (
                <UpsetPlot data={settings} parentWidth={currentParentWidth} parentHeight={currentParentHeight} />
            ) : (
                <div>
                    Error loading summary slice
                </div>
            )}
        </div>
    );
};

export default CombinationSettings;