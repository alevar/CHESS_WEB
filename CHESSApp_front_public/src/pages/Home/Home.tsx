import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import CardGrid from '../../components/common/CardGrid/CardGrid';
import build_penguin from "../../assets/images/build.penguin.2.jpeg";
import download_penguin from '../../assets/images/download.penguin.1.jpeg';
import search_penguin from '../../assets/images/search.penguin.1.jpeg';

const cards = [
  {
    link: 'custom',
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
    link: 'explore',
    title: 'Explore',
    imageSrc: search_penguin,
    description: 'Browse, explore and download various files curated, built and provided by the CHESS 3 team.'
  }
];

const Home: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">Welcome to CHESS</h1>
          <p className="text-center mb-5">
            A unified resource for downloading and customizing genome annotations.
          </p>
        </Col>
      </Row>
      <CardGrid cards={cards} />
    </Container>
  );
};

export default Home;