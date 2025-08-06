import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Sidebar from '../../components/common/Sidebar/Sidebar';

const Explore: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col xs={12} md={3} lg={3} className="mb-4 mb-md-0">
          <Sidebar title="Explore Tools">
            <div>Sidebar content for explore page.</div>
          </Sidebar>
        </Col>
        <Col xs={12} md={9} lg={9}>
          <h1 className="mb-4">Explore Genes</h1>
          <p className="mb-4">Load and explore information about genes from the database.</p>
          <Card>
            <Card.Body>
              <Card.Text className="text-muted">Gene exploration coming soon.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Explore; 