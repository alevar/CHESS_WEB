import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DownloadButton from '../../DownloadButton/DownloadButton';
import SourceSettings from './components/SourceSettings/SourceSettings';
import DataSettings from './components/DataSettings/DataSettings'; // Import DataSettings
import SummaryView from './components/SummaryView/SummaryView';
import CombinationSettings from './components/CombinationSettings/CombinationSettings';
import { DatabaseState } from '../../../features/database/databaseSlice';
import {
    SettingsState,
    addAttribute,
    removeAttribute,
    addSourceIntersection,
    removeSourceIntersection,
} from '../../../features/settings/settingsSlice';
import { useGetTxSummarySliceQuery } from '../../../features/summary/summaryApi';
import './Custom.css';

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
}

const Custom: React.FC = () => {
    const dispatch = useDispatch();
    const settings = useSelector((state: RootState) => state.settings);
    const [buttonStates, setButtonStates] = useState({});
    const initialButtonStatesSet = useRef(false);
    const { data, error, isLoading, refetch } = useGetTxSummarySliceQuery(settings.value);

    const [summaryViewSize, setSummaryViewSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const summaryViewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!initialButtonStatesSet.current && settings.status === "idle") {
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
                dispatch(addAttribute([type, sourceID, kvid]));
            } else {
                dispatch(removeAttribute([type, sourceID, kvid]));
            }
            return { ...prevStates, [buttonKey]: newState };
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await refetch();
            } catch (error) {
                // Handle error appropriately
            }
        };
        fetchData();
    }, [settings.value, refetch]);

    const [activeAccordionKey, setActiveAccordionKey] = useState<string | null>(null);
    const handleAccordionChange = (key: string | null) => {
        setActiveAccordionKey(key);
    };

    const [selectedIntersections, setSelectedIntersections] = useState<number[]>([]);
    const handleIntersectionClick = (ixData: { set: any, intersection: any, index: number }) => {
        setSelectedIntersections((prevSelectedIntersections) => {
            if (prevSelectedIntersections.includes(ixData.intersection.set)) {
                dispatch(removeSourceIntersection(ixData.intersection.set));
                return prevSelectedIntersections.filter((set) => set !== ixData.intersection.set);
            } else {
                dispatch(addSourceIntersection(ixData.intersection.set));
                return [...prevSelectedIntersections, ixData.intersection.set];
            }
        });
    };

    useEffect(() => {
        const updateSummaryViewSize = () => {
            if (summaryViewRef.current) {
                setSummaryViewSize({
                    width: summaryViewRef.current.clientWidth,
                    height: summaryViewRef.current.clientHeight,
                });
            }
        };
        updateSummaryViewSize();
        window.addEventListener('resize', updateSummaryViewSize);
        return () => window.removeEventListener('resize', updateSummaryViewSize);
    }, []);

    return (
        <div className="custom-wrapper">
            <div className="custom-sidebar">
                <SourceSettings
                    buttonStates={buttonStates}
                    onButtonClickProp={handleButtonClick}
                    activeAccordionKey={activeAccordionKey}
                    onAccordionChange={handleAccordionChange}
                />
                <DataSettings />
                <DownloadButton />
            </div>
            <div className="custom-main" ref={summaryViewRef}>
                {/* <div className="custom-section">
                    <div className="custom-section-header">
                        <h2>Combinations</h2>
                    </div>
                    <CombinationSettings
                        selectedIntersections={selectedIntersections}
                        onIntersectionClick={handleIntersectionClick}
                        parentWidth={summaryViewSize.width}
                        parentHeight={summaryViewSize.height}
                    />
                </div> */}
                <div className="custom-section">
                    <div className="custom-section-header">
                        <h2>Summary</h2>
                    </div>
                    <SummaryView
                        parentWidth={summaryViewSize.width}
                        parentHeight={summaryViewSize.height}
                    />
                </div>
            </div>
        </div>
    );
};

export default Custom;
