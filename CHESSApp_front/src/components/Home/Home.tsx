import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from "../../app/hooks"
import { useSelector, useDispatch } from 'react-redux';

import {set_nascent, selectSettings} from "../../features/settings/settingsSlice"

import './Home.css'

const Home = () => {
  return (
    <div className="container">
      <div className="home">
        <h1 className="header">Welcome to the CHESS Web Interface</h1>
        <p className="description">A unified resource for downloading existing and customizing genome annotations.</p>
        <p className="get-started">Get started by:</p>
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <Link to="/annotations" className="card-link">Customize Available Annotations</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <Link to="/annotations" className="card-link">Download Ready-To-Use CHESS 3 annotation</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <Link to="/genes" className="card-link">Explore Individual genes</Link>
              </div>
            </div>
          </div>
        </div>


        <div>
        {(() => {
                  const settings = useSelector(selectSettings);
                  const dispatch = useDispatch();

                  const handleToggleNascent = (event: React.ChangeEvent<HTMLInputElement>) => {
                    dispatch(set_nascent(event.target.checked));
                  };

                  return (
                    <>
                      <p>Current format: {settings.format}. Nascent included: 
                        <input 
                          type="checkbox" 
                          checked={settings.include_nascent} 
                          onChange={handleToggleNascent} 
                        />
                      </p>
                    </>
                  );
                })()}
        </div>



      </div>
    </div>
  );
}

export default Home;
