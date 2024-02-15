import React, { useState } from "react";
import { Nav, Col, Tab, Accordion, Form } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { DatabaseState } from '../../features/database/databaseSlice';
import {
    SettingsState,
    add_source,
    remove_source,
    set_nascent,
} from '../../../../../features/settings/settingsSlice';

import "./SideBar.scss";

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
}

const SideBar: React.FC = () => {

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
    };

    // Nascent switch
    const [nascentSwitchState, setNascentSwitchState] = useState<boolean>(false);
    const handleNascentSwitchChange = (event) => {
        const isChecked = event.target.checked;
        setNascentSwitchState(isChecked);
        dispatch(set_nascent(isChecked));
    };

    return (
        <div className="offcanvas-md offcanvas-end bg-body-tertiary" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="sidebarMenuLabel">Company name</h5>
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
                                <Nav.Link eventKey="#intersections">Intersections</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="#other">Other</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col md={9} className="sidebar-content">
                        <Tab.Content>
                            <Tab.Pane eventKey="#sources">
                                <h1>Sources</h1>
                                <section>
                                    <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                        <div className="container" style={{ height: '35vh', overflowY: 'auto' }}>
                                            {globalData?.ass2src[settings.value.genome].map((sourceID, index) => {
                                                const isSourceIncluded = settings.value.sources_include.includes(Number(sourceID)) === true;

                                                return (
                                                    <div>
                                                        <Form.Switch
                                                            type="checkbox"
                                                            id={sourceID.toString()}
                                                            label={globalData?.sources[sourceID].name}
                                                            checked={isSourceIncluded}
                                                            onChange={(event) => onCheckboxChange(sourceID, event)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </section>
                            </Tab.Pane>
                            <Tab.Pane eventKey="#intersections">
                                <h1>Intersections</h1>
                                <section>UpsetPlot</section>
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
