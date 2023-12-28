import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DatabaseState } from '../../features/database/databaseSlice';
import { SettingsState, set_organism } from '../../features/settings/settingsSlice';

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
  }

const SelectOrganism: React.FC = () => {
    const globalData = useSelector((state: RootState) => state.database.data);
    const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleCardClick = (selectedValue: string) => {
    navigate(`/select/${selectedValue}`);
    dispatch(set_organism([selectedValue]));
  };

  return (
    <div className="container">
      <div className="select">
        <h1 className="header">Select Organism</h1>
        <div className="row d-flex">
            {Object.entries(globalData?.organisms || {}).map(([key, value], index) => (
            <div
              key={value["id"]}
              className="col-md-4 d-flex"
            >
              <div
                className="card flex-fill"
                onClick={() => handleCardClick(value["id"])}
              >
                <div className="card-body">{value["commonName"]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectOrganism;
