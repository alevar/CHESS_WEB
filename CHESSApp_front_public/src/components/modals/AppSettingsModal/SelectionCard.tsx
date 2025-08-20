import React from 'react';
import { Card } from 'react-bootstrap';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: React.ReactNode;
  isSelected?: boolean;
  onClick: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ 
  title, 
  subtitle, 
  description, 
  metadata, 
  isSelected, 
  onClick 
}) => (
  <Card 
    className={`h-100`}
    onClick={onClick}
    style={{ 
      cursor: 'pointer',
      borderWidth: '1px',
      borderColor: isSelected ? '#0d6efd' : '#dee2e6',
      backgroundColor: isSelected ? '#f8f9ff' : 'white'
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = '#6c757d';
        e.currentTarget.style.backgroundColor = '#f8f9fa';
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.currentTarget.style.borderColor = '#dee2e6';
        e.currentTarget.style.backgroundColor = 'white';
      }
    }}
  >
    <Card.Body>
      <Card.Title className={`h6 ${isSelected ? 'text-primary' : ''}`}>{title}</Card.Title>
      {subtitle && <Card.Subtitle className="mb-2 text-muted small">{subtitle}</Card.Subtitle>}
      {description && <Card.Text className="small">{description}</Card.Text>}
      {metadata}
    </Card.Body>
  </Card>
);

export default SelectionCard;