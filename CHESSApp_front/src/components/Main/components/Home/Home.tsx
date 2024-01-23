import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  // get current base path
  const location = useLocation();
  const base_path = location.pathname.split('/').slice(0, -1).join('/');

  return (
    <div className="home">
      <h1 className="header">Welcome to the CHESS Web Interface</h1>
      <p className="description">A unified resource for downloading and customizing genome annotations.</p>
      <div className="row d-flex">
        <div className="col-md-4 d-flex">
          <div className="card flex-fill" onClick={() => handleCardClick(base_path+"/custom")}>
            <div className="card-body">
              Create Custom CHESS Annotation
            </div>
          </div>
        </div>
        <div className="col-md-4 d-flex">
          <div className="card flex-fill" onClick={() => handleCardClick(base_path+"/selectPrecompiled")}>
            <div className="card-body">
              Download Ready-To-Use CHESS 3 annotation
            </div>
          </div>
        </div>
        <div className="col-md-4 d-flex">
          <div className="card flex-fill" onClick={() => handleCardClick(base_path+"/explore")}>
            <div className="card-body">
              Explore Data
            </div>
          </div>
        </div>
        <div className="col-md-4 d-flex">
          <div className="card flex-fill" onClick={() => handleCardClick("/genomes")}>
            <div className="card-body">
              Explore Other Genomes and Assemblies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;