import { Link } from 'react-router-dom';

import './Home.css'

const Home = () => {
  return (
    <div className="container">
      <div className="home">
        <h1 className="header">Welcome to the CHESS Web Interface</h1>
        <p className="description">A unified resource for downloading existing and creating custom genome annotations.</p>
        <p className="get-started">Get started by:</p>
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <Link to="/annotations" className="card-link">Create your own annotation</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <Link to="/annotations" className="card-link">Download our state-of-the-art CHESS 3 annotation</Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <Link to="/genes" className="card-link">Explore your favorite genes in our new view</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
