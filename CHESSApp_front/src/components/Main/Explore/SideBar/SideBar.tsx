import React, { useState, useEffect } from "react";
import { Nav, Col, Tab, Accordion, Form, Button, Table } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import UpsetPlot from "../../UpsetPlot/UpsetPlot";
import Spinner from 'react-bootstrap/Spinner';
import { sum_of_leaves } from '../../../../utils/utils';

import { DatabaseState } from "../../../../features/database/databaseSlice";
import {
    SettingsState,
    add_source,
    remove_source,
    set_nascent,
    add_source_intersection,
    remove_source_intersection,
} from '../../../../features/settings/settingsSlice';
import { LocusState } from '../../../../features/locus/locusSlice';
import { useGetTxSummarySliceQuery } from '../../../../features/summary/summaryApi';

import "./SideBar.scss";

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
    locus: LocusState;
}

const SideBar: React.FC = () => {

    const globalData = useSelector((state: RootState) => state.database.data);
    const settings = useSelector((state: RootState) => state.settings);
    const summary = useSelector((state: RootState) => state.summary);
    const loci = useSelector((state: RootState) => state.loci);
    const dispatch = useDispatch();

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

    const onCheckboxChange = (sid, event) => {
        // if checked, add to the list, otherwise remove
        if (event.target.checked) {
            dispatch(add_source(sid));
        } else {
            dispatch(remove_source(sid));
        }
    };

    // Nascent switch
    const [nascentSwitchState, setNascentSwitchState] = useState<boolean>(false);
    const handleNascentSwitchChange = (event) => {
        const isChecked = event.target.checked;
        setNascentSwitchState(isChecked);
        dispatch(set_nascent(isChecked));
    };

    // UpsetPlot selection listeners
    const [upsetData, setUpsetData] = useState({});
    useEffect(() => {
        // Logic to handle settings update
        // Trigger re-render of the UpsetPlot component with updated settings
        const sets = {};
        for (const sourceID of settings.value.sources_include) {
            sets[sourceID] = globalData.sources[sourceID].name;
        }
        const intersections = [];
        for (const [sourceIDs, attrs] of Object.entries(summary.data.summary)) {
            let total_count = sum_of_leaves(attrs);
            intersections.push({ set: sourceIDs, value: total_count });
        }
        setUpsetData({ sets, intersections });
    }, [summary]);

    const [selectedIntersections, setSelectedIntersections] = useState<number[]>([]);
    const handleIntersectionClick = (ixData: { set: any, intersection: any, index: number }) => {
        // toggle selections and dispatch actions to update settings
        setSelectedIntersections((prevSelectedIntersections) => {
            if (prevSelectedIntersections.includes(ixData.intersection.set)) {
                // update settings
                dispatch(remove_source_intersection(ixData.intersection.set));
                // Remove the index if already selected
                return prevSelectedIntersections.filter((set) => set !== ixData.intersection.set);
            } else {
                // update settings
                dispatch(add_source_intersection(ixData.intersection.set));
                // Add the index if not selected
                return [...prevSelectedIntersections, ixData.intersection.set];
            }
        });
    };

    // Advanced source settings
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const handleAdvancedButtonClick = () => {
        setShowAdvancedSettings(!showAdvancedSettings);
    };

    return (
        <div className="offcanvas-md offcanvas-end bg-body-tertiary" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="sidebarMenuLabel"></h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body d-md-flex p-0 pt-lg-3 overflow-y-auto">
                <Tab.Container defaultActiveKey="#sources">
                    <Col md={3}>
                        <Nav className="sideways-tabs nav-tabs left-tabs">
                            <Nav.Item>
                                <Nav.Link eventKey="#sources">Sources</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="#genes">Genes</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="#other">Other</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col md={9} className="sidebar-content">
                        <Tab.Content>
                            <Tab.Pane eventKey="#sources">
                                <h3>Sources</h3>
                                <section>
                                    <div className="row">
                                        {globalData?.ass2src[settings.value.genome].map((sourceID, index) => {
                                            const isSourceIncluded = settings.value.sources_include.includes(Number(sourceID)) === true;

                                            return (
                                                <Form.Switch
                                                    type="checkbox"
                                                    id={sourceID.toString()}
                                                    label={globalData?.sources[sourceID].name}
                                                    checked={isSourceIncluded}
                                                    onChange={(event) => onCheckboxChange(sourceID, event)}
                                                />
                                            );
                                        })}
                                    </div>
                                    <Button onClick={handleAdvancedButtonClick} className="mt-3">
                                        {showAdvancedSettings ? 'Hide Advanced' : 'Show Advanced'}
                                    </Button>

                                    {showAdvancedSettings && (
                                        <div>
                                            {summary.status === "loading" ? (
                                                <Spinner animation="border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </Spinner>
                                            ) : summary.status === "succeeded" ? (
                                                <UpsetPlot
                                                    data={upsetData}
                                                    components={{
                                                        dot: {
                                                            draw: true,
                                                            height: 0.9,
                                                            width: 1,
                                                        }, bar: {
                                                            draw: false,
                                                            height: 0,
                                                            width: 0,
                                                        }, tooltip: {
                                                            draw: false,
                                                            height: 0,
                                                            width: 0,
                                                        }, names: {
                                                            draw: true,
                                                            height: 0.1,
                                                            width: 1,
                                                        }
                                                    }}
                                                    selectedIntersections={selectedIntersections}
                                                    onIntersectionClick={handleIntersectionClick}
                                                    width={200}
                                                    height={400} />
                                            ) : (
                                                <div>
                                                    Error loading summary slice
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>
                            </Tab.Pane>
                            <Tab.Pane eventKey="#genes">
                                <h3>Genes</h3>
                                <section>
                                    {
                                        loci.locus.status === "loading" ? (
                                            <Spinner animation="border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                        ) : loci.locus.status === "succeeded" ? (
                                                        <Table striped bordered hover>
                                                            <thead>
                                                                <tr>
                                                                    <th>Gene Name</th>
                                                                    <th>Source</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Object.entries(loci.locus.data.data.genes).map(([gid, geneData], index) => (
                                                                    <tr key={gid} onClick={() => console.log(`Clicked on ${gid}`)}>
                                                                        <td>{geneData.gene_name}</td>
                                                                        <td>{globalData.sources[geneData.sourceID]["name"]}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                        ) : (
                                            <div>
                                                Error loading locus data
                                            </div>
                                        )
                                    }
                                </section>
                            </Tab.Pane>
                            <Tab.Pane eventKey="#other">
                                <h1>Other Settings</h1>
                                <section>
                                    <div>
                                        <Form.Switch
                                            type="switch"
                                            id="nascentSwitch"
                                            label="Include Nascent RNA"
                                            checked={nascentSwitchState}
                                            onChange={handleNascentSwitchChange}
                                        />
                                    </div>
                                </section>
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Tab.Container>
            </div>
        </div>
    );
};

export default SideBar;
