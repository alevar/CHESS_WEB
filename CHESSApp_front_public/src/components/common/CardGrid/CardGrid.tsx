import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CardGrid.css';

interface CardProps {
  link: string;
  title: string;
  imageSrc: string;
  description: string;
}

interface CardGridProps {
  cards: CardProps[];
}

const CardGrid: React.FC<CardGridProps> = ({ cards }) => {
  return (
    <Container className="my-4 card-grid">
      <Row>
        {cards.map((card, index) => (
          <Col md={4} key={index} className="mb-4">
            <Link to={card.link} className="text-decoration-none">
              <Card className="h-100 text-center">
                <Card.Img 
                  src={card.imageSrc} 
                  alt={card.title} 
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{card.title}</Card.Title>
                  <Card.Text className="flex-grow-1">{card.description}</Card.Text>
                  <div className="mt-auto">
                    <button className="btn btn-primary">Go</button>
                  </div>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CardGrid;