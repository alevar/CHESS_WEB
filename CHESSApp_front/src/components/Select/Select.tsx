import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'react-bootstrap';
import { DatabaseState } from '../../features/database/databaseSlice';
import { SettingsState, set_select_sources } from '../../features/settings/settingsSlice';
import MockGraphic from './components/MockGraphic/MockGraphic';
import DownloadButton from './components/DownloadButton/DownloadButton';
import './Select.css';

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

interface AnnotationItem {
  name: string;
  information: string;
  // Add any other properties as needed
}

const Select: React.FC = () => {
    const globalData = useSelector((state: RootState) => state.database.data);
    const dispatch = useDispatch();
  
    const [selectedItem, setSelectedItem] = useState<AnnotationItem | null>(null);
    const [hoveredItem, setHoveredItem] = useState<AnnotationItem | null>(null);
  
    const handleItemHover = (item: AnnotationItem) => {
      setHoveredItem(item);
    };
  
    const handleItemClick = (item: AnnotationItem) => {
      setSelectedItem(item);
      dispatch(set_select_sources([item.name]));
    };
  
    const handleItemLeave = () => {
      setHoveredItem(null);
    };
  
    const generateRandomData = (): { genes: number; transcripts: number } => {
      return {
        genes: Math.floor(Math.random() * 20000),
        transcripts: Math.floor(Math.random() * 300000),
      };
    };
  
    return (
      <div className="select-container">
        {/* Left Panel - Item Selection */}
        <div className="left-panel">
          <h2>Available Annotations</h2>
          <div className="item-list">
            {Object.entries(globalData?.sources?.GRCh38 || {}).map(([key, value], index) => (
              <button
                key={index}
                onMouseOver={() => handleItemHover(value)}
                onMouseLeave={handleItemLeave}
                onClick={() => handleItemClick(value)}
                className={`item-button ${
                  selectedItem === value
                    ? 'selected'
                    : hoveredItem === value
                    ? 'hovered'
                    : ''
                }`}
              >
                {value.name}
              </button>
            ))}
          </div>
        </div>
  
        {/* Right Panel - Display Information and Graphic */}
        <div className="right-panel">
          {/* Text Column */}
          <div className="text-column">
            {hoveredItem || selectedItem ? (
              <>
                <h2>{hoveredItem?.name || selectedItem?.name}</h2>
                <p>{hoveredItem?.information || selectedItem?.information}</p>
                {selectedItem && (
                  <>
                    <Button variant="secondary" className="me-2">Customize</Button>
                    <DownloadButton />
                  </>
                )}
              </>
            ) : (
              <p>Hover over or select an item to view information.</p>
            )}
          </div>
  
          {/* Figure Column */}
          <div className="figure-column">
            {hoveredItem || selectedItem ? (
              <MockGraphic
                data={[
                  {
                    type: 'Protein-coding',
                    ...generateRandomData(),
                  },
                  {
                    type: 'lncRNA',
                    ...generateRandomData(),
                  },
                  {
                    type: 'Pseudogene',
                    ...generateRandomData(),
                  },
                  {
                    type: 'Other',
                    ...generateRandomData(),
                  },
                ]}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  };
  
  export default Select;