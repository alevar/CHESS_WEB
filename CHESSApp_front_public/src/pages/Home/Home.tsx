import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import CardGrid from './components/CardGrid/CardGrid';
import build_penguin from "../../assets/images/build.penguin.2.jpeg";
import download_penguin from '../../assets/images/download.penguin.1.jpeg';
import search_penguin from '../../assets/images/search.penguin.1.jpeg';

const cards = [
  {
    link: 'browser',
    title: 'Genome Browser',
    imageSrc: build_penguin,
    description: 'Explore the genomes and annotations included in the CHESS database.'
  },
  {
    link: 'download',
    title: 'Download Curated Files',
    imageSrc: download_penguin,
    description: 'Download curated files from the CHESS database.'
  },
  {
    link: 'explore',
    title: 'Explore',
    imageSrc: search_penguin,
    description: 'Explore genes and transcripts in the CHESS database.'
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