import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Home: React.FC = () => (
  <Container className="mt-5">
    <Row>
      <Col>
        <h2>Welcome to the Home Page</h2>
        <p>This is the main page of our application, styled with React-Bootstrap!</p>
      </Col>
    </Row>
  </Container>
);

export default Home;
