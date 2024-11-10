import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const About: React.FC = () => (
  <Container className="mt-5">
    <Row>
      <Col>
        <h2>About Us</h2>
        <p>This is a sample application built with Vite, React, TypeScript, Redux, and SWC.</p>
      </Col>
    </Row>
  </Container>
);

export default About;
