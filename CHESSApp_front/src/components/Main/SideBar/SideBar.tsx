import React, { ReactNode, useState, useEffect } from "react";
import { Nav, Col, Tab, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../app/store';

import "./SideBar.scss";

interface SidebarProps {
  tabs: { key: string; title: string; content: ReactNode }[];
  advancedSettingsContent?: ReactNode;
}

const SideBar: React.FC<SidebarProps> = ({ tabs, advancedSettingsContent }) => {
  const dispatch = useDispatch();

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
        <Tab.Container defaultActiveKey={tabs[0]?.key}>
          <Col md={3}>
            <Nav className="sideways-tabs nav-tabs left-tabs">
              {tabs.map((tab) => (
                <Nav.Item key={tab.key}>
                  <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>
          <Col md={9} className="sidebar-content">
            <Tab.Content>
              {tabs.map((tab) => (
                <Tab.Pane eventKey={tab.key} key={tab.key}>
                  {tab.content}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Col>
        </Tab.Container>
      </div>
      {advancedSettingsContent && (
        <div className="advanced-settings">
          <button onClick={handleAdvancedButtonClick} className="mt-3">
            {showAdvancedSettings ? 'Hide Advanced' : 'Show Advanced'}
          </button>
          {showAdvancedSettings && <div>{advancedSettingsContent}</div>}
        </div>
      )}
    </div>
  );
};

export default SideBar;
