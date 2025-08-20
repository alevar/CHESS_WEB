import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FullTranscriptData } from '../../../types/geneTypes';

interface AttributeDisplayProps {
  transcriptData: FullTranscriptData | null;
  onAttributeHover?: (attributeName: string | null) => void;
  hoveredAttribute?: string | null;
  layout?: 'single' | 'multicolumn';
}

const AttributeDisplay: React.FC<AttributeDisplayProps> = ({ 
  transcriptData, 
  onAttributeHover,
  hoveredAttribute,
  layout = 'multicolumn'
}) => {
  if (!transcriptData?.attributes) {
    return null;
  }

  const handleMouseEnter = (attributeName: string) => {
    onAttributeHover?.(attributeName);
  };

  const handleMouseLeave = () => {
    onAttributeHover?.(null);
  };

  return (
    <Row xs={1} md={layout === 'single' ? 2 : 1} lg={layout === 'single' ? 3 : 1} className="g-3">
      {Object.entries(transcriptData.attributes).map(([key, value]) => (
        <Col key={key}>
          <Card 
            className={`h-100 attribute-card ${hoveredAttribute === key ? 'matching' : ''}`}
            onMouseEnter={() => handleMouseEnter(key)}
            onMouseLeave={handleMouseLeave}
          >
            <Card.Body>
              <Card.Subtitle className="mb-2 text-muted text-uppercase">
                {key}
              </Card.Subtitle>
              <Card.Text as="div">
                <code className="small">{String(value)}</code>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default AttributeDisplay;