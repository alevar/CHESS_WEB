import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const CustomAnnotation: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="mb-4">Custom Annotation</h1>
          <p className="mb-4">Create custom versions of the annotation by including/excluding transcript and gene types, or adding information from additional catalogues.</p>
          <Card>
            <Card.Body>
              <Card.Text className="text-muted">Custom annotation builder coming soon.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomAnnotation; 