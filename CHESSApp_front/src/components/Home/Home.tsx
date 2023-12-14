import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container">
      <div className="home">
        <h1 className="header">Welcome to the CHESS Web Interface</h1>
        <p className="description">A unified resource for downloading existing and customizing genome annotations.</p>
        <p className="get-started">Get started by:</p>
        <div className="row d-flex">
          <div className="col-md-4 d-flex">
            <div className="card flex-fill" onClick={() => handleCardClick("/custom")}>
              <div className="card-body">
                <Link to="/custom" className="card-link">Customize Available Annotations</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex">
            <div className="card flex-fill" onClick={() => handleCardClick("/select")}>
              <div className="card-body">
                <Link to="/select" className="card-link">Download Ready-To-Use CHESS 3 annotation</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4 d-flex">
            <div className="card flex-fill" onClick={() => handleCardClick("/genes")}>
              <div className="card-body">
                <Link to="/genes" className="card-link">Explore Individual Genes</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;