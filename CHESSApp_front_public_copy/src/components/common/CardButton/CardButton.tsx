import React from 'react';
import { Card } from 'react-bootstrap';

interface CardButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

const CardButton: React.FC<CardButtonProps> = ({ title, description, onClick, className = '' }) => {
  return (
    <Card 
      className={`shadow-sm cursor-pointer ${className}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        <Card.Title className="h5 mb-2">{title}</Card.Title>
        <Card.Text className="text-muted">{description}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default CardButton;
