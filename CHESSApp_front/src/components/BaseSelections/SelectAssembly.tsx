import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DatabaseState } from '../../features/database/databaseSlice';
import { SettingsState, set_assembly } from '../../features/settings/settingsSlice';

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
  }

const SelectAssembly: React.FC = () => {
  const { organism } = useParams();
  const globalData = useSelector((state: RootState) => state.database.data);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const handleCardClick = (selectedValue: int) => {
    navigate(`/select/${organism}/${selectedValue}`);
    dispatch(set_assembly([selectedValue]));
  };

  return (
    <div className="container">
      <div className="select">
        <h1 className="header">{`Select Assembly for ${organism}`}</h1>
        <div className="row d-flex">
        {Object.entries(globalData?.summary[organism] || {}).map(([key, value], index) => (
            <div
              key={key}
              className="col-md-4 d-flex"
            >
              <div
                className="card flex-fill"
                onClick={() => handleCardClick(key)}
              >
                <div className="card-body">{key}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectAssembly;
