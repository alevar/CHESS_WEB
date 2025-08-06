import React from 'react';
import { Col } from 'react-bootstrap';

export const StatsCard: React.FC<{ 
  count: number; 
  label: string; 
  variant: 'primary' | 'success' | 'secondary' 
}> = ({ count, label, variant }) => (
  <Col md={2} sm={4} className="mb-3">
    <div className="text-center">
      <h3 className={`text-${variant}`}>
        {count.toLocaleString()}
      </h3>
      <p className="text-muted">{label}</p>
    </div>
  </Col>
);