import React from 'react';
import { Col, Button } from 'react-bootstrap';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  section: string;
  variant: string;
  onClick: (section: string) => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  icon, 
  label, 
  section, 
  variant, 
  onClick 
}) => (
  <Col md={3} sm={6} className="mb-3">
    <Button 
      variant={`outline-${variant}`}
      className="w-100 h-100 p-4"
      onClick={() => onClick(section)}
    >
      <i className={`${icon} mb-2 fs-1`} />
      <br />
      {label}
    </Button>
  </Col>
); 