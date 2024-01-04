import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { DatabaseState } from '../../features/database/databaseSlice';
import { set_attributes, set_include_sources } from '../../features/settings/settingsSlice';

interface RootState {
  database: DatabaseState;
}

const Home = () => {
  // when here, need to pre-load all configurations into the settings
  const globalData = useSelector((state: RootState) => state.database.data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(set_include_sources([4]));
    dispatch(set_attributes(globalData.src2attr));
  }, [dispatch, globalData.src2attr]);

  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container">
      <div className="home">
        <h1 className="header">Welcome to the CHESS Web Interface</h1>
        <p className="description">A unified resource for downloading and customizing genome annotations.</p>
        <div className="row d-flex">
          <div className="col-md-4 d-flex">
            <div className="card flex-fill" onClick={() => handleCardClick("/custom")}>
              <div className="card-body">
                Create Custom CHESS Annotation
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex">
            <div className="card flex-fill" onClick={() => handleCardClick("/selectPrecompiled")}>
              <div className="card-body">
                Download Ready-To-Use CHESS 3 annotation
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex">
            <div className="card flex-fill" onClick={() => handleCardClick("/genes")}>
              <div className="card-body">
                Explore Individual Genes
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex">
            <div className="card flex-fill" onClick={() => handleCardClick("/genes")}>
              <div className="card-body">
                Explore Other Genomes and Assemblies
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;