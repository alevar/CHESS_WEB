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
    <Container className="my-4">
      <Row>
        {cards.map((card) => (
          <Col md={4} key={card.link} className="mb-4">
            <Link to={`/project/${card.link}`} className="text-decoration-none">
              <Card className="entry-card text-center">
                <Card.Img src={card.imageSrc} alt={card.title} className="card-img-top" />
                <Card.Body>
                  <Card.Title>{card.title}</Card.Title>
                </Card.Body>
                <div className="card-overlay">
                  <p className="card-description">{card.description}</p>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CardGrid;