import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Github } from 'react-bootstrap-icons';

const ContactUs: React.FC = () => (
  <Container className="mt-5">
    <Row>
      <Col lg={8} className="mx-auto">
        <h1 className="mb-4">Contact Us</h1>
        <Card className="mb-4">
          <Card.Body>
            <h3>Email Support</h3>
            <p>
              For general inquiries, technical support, or collaboration opportunities, please contact us at:
            </p>
            <div className="text-center">
              <a 
                href="mailto:chess-support@jhu.edu" 
                className="btn btn-primary btn-lg"
                style={{ fontSize: '1.2rem' }}
              >
                ales[dot]varabyou[at]jhu[dot]edu
              </a>
            </div>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body>
            <h3>GitHub Issues</h3>
            <p>
              Found a bug, have a feature request, or want to contribute to the project? 
              Please use our GitHub repository to report issues you encounter with either the web interface or the data.
            </p>
            <div className="text-center">
              <a 
                href="https://github.com/alevar/CHESS_WEB/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-lg"
              >
                <Github className="me-2" />
                View GitHub Issues
              </a>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default ContactUs;
