import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import './Home.css';

import build_penguin from '../../../../public/build.penguin.2.jpeg';
import download_penguin from '../../../../public/download.penguin.1.jpeg';
import search_penguin from '../../../../public/search.penguin.1.jpeg';

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
      <Row className="my-4">
        <Col md={12} className="text-center">
          <h1>Welcome to the CHESS Web Interface</h1>
          <p className="description">
            A unified resource for downloading and customizing genome annotations.
          </p>
          <p>
            Our resource allows you to download the latest state-of-the art CHESS genome annotation, build custom slices of the data based on
            support from various types of experimental data, such as expression across bodysites, conservation across species, ML predictions, and others.
            We provide several tools for enhancing genome annotation with additional resources, as well as custom enhancements, such as inclusion of nascent RNA,
            transcript 3' and 5' extensions and others.
          </p>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md={3}>
          <Card
            onClick={() => handleCardClick(base_path + "/custom")}
            className="custom-card"
          >
            <Card.Header className="card-header">
              Customize CHESS Annotation
            </Card.Header>
            <Card.Body className="card-body-tall">
              <img src={build_penguin} alt="PenguinBuild" className="card-image" />
              <div className="panel">
                <p>User friendly interface for enhancing the CHESS annotation with custom collections of genes and transcripts based on multiple gene catalogs and experimental evidence.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            onClick={() => handleCardClick(base_path + "/selectPrecompiled")}
            className="custom-card"
          >
            <Card.Header className="card-header">
              Download Curated Files
            </Card.Header>
            <Card.Body className="card-body-tall">
              <img src={download_penguin} alt="PenguinDownload" className="card-image" />
              <div className="panel">
                <p>
                  Browse, explore and download various files curated, built and provided by the CHESS 3 team.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card
            onClick={() => handleCardClick(base_path + "/explore")}
            className="custom-card"
          >
            <Card.Header className="card-header">
              Explore Data
            </Card.Header>
            <Card.Body className="card-body-tall">
              <img src={search_penguin} alt="PenguinSearch" className="card-image" />
              <div className="panel">
                <p>
                  Browse, explore and download various files curated, built and provided by the CHESS 3 team.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Home;