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

  const handleCardClick = (selectedValue: number) => {
    navigate(`/select/${organism}/${selectedValue}`);
    dispatch(set_assembly(selectedValue));
  };

  return (
    <div className="container">
      <div className="select">
        <h1 className="header">{`Select Assembly for ${globalData?.organisms[organism]["commonName"]}`}</h1>
        <div className="row d-flex">
          {globalData?.org2ass[organism].map((assemblyID, index) => (
            <div
              key={Number(assemblyID)}
              className="col-md-4 d-flex"
            >
              <div
                className="card flex-fill"
                onClick={() => handleCardClick(Number(assemblyID))}
              >
                <div className="card-body">{globalData?.assemblies[assemblyID]["assembly"]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectAssembly;
