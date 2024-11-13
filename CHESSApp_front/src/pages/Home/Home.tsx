import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

import CardGrid from '../../components/common/CardGrid/CardGrid';

import build_penguin from "../../assets/images/build.penguin.2.jpeg";
import download_penguin from '../../assets/images/download.penguin.1.jpeg';
import search_penguin from '../../assets/images/search.penguin.1.jpeg';

import './Home.css';

const cards = [
  {
    link: 'build',
    title: 'Customize CHESS Annotation',
    imageSrc: build_penguin,
    description: 'User friendly interface for enhancing the CHESS annotation with custom collections of genes and transcripts based on multiple gene catalogs and experimental evidence.'
  },
  {
    link: 'download',
    title: 'Download Curated Files',
    imageSrc: download_penguin,
    description: 'Browse, explore and download various files curated, built and provided by the CHESS 3 team.'
  },
  {
    link: 'search',
    title: 'Explore',
    imageSrc: search_penguin,
    description: 'Browse, explore and download various files curated, built and provided by the CHESS 3 team.'
  }
]

const Home: React.FC = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col>
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
      <CardGrid cards={cards} />
    </Container>
  )
};

export default Home;