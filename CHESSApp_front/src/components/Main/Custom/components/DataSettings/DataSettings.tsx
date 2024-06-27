import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import UpsetPlot from '../CombinationSettings/components/UpsetPlot/UpsetPlot';
import Spinner from 'react-bootstrap/Spinner';
import { sum_of_leaves } from '../../../../../utils/utils';

import { DatabaseState } from '../../../../../features/database/databaseSlice';
import { SettingsState } from '../../../../../features/settings/settingsSlice';
import { SummaryState } from '../../../../../features/summary/summarySlice';

import './DataSettings.css';

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
    summary: SummaryState;
}

const DataSettings: React.FC = () => {
    const summary = useSelector((state: RootState) => state.summary);
    const settings = useSelector((state: RootState) => state.settings);
    const globalData = useSelector((state: RootState) => state.database);

    const [upsetData, setUpsetData] = useState({});
    const [selectedIntersections, setSelectedIntersections] = useState<number[]>([]);

    useEffect(() => {
        const sets = {};
        for (const sourceID of settings.value.sources_include) {
            sets[sourceID] = globalData.data.sources[sourceID].name;
        }
        const intersections = [];
        for (const [sourceIDs, attrs] of Object.entries(summary.data.summary)) {
            let total_count = sum_of_leaves(attrs);
            intersections.push({ set: sourceIDs, value: total_count });
        }
        setUpsetData({ sets, intersections });
    }, [summary]);

    const handleIntersectionClick = (ixData: { set: any, intersection: any, index: number }) => {
        setSelectedIntersections((prevSelectedIntersections) => {
            if (prevSelectedIntersections.includes(ixData.intersection.set)) {
                return prevSelectedIntersections.filter((set) => set !== ixData.intersection.set);
            } else {
                return [...prevSelectedIntersections, ixData.intersection.set];
            }
        });
    };

    return (
        <div className="custom-container">
            <div className="custom-header">Datasets</div>
            {summary.status === "loading" ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : summary.status === "succeeded" ? (
                <UpsetPlot
                    data={upsetData}
                    selectedIntersections={selectedIntersections}
                    onIntersectionClick={handleIntersectionClick}
                    width={350} // Adjust the width as needed
                    height={200} // Adjust the height as needed
                />
            ) : (
                <div>Error loading summary slice</div>
            )}
        </div>
    );
};

export default DataSettings;
