import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Github, Envelope } from 'react-bootstrap-icons';

const ContactUs: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} xl={6} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
            <p className="lead text-muted">
              Get support or contribute to the CHESS project
            </p>
          </div>

          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <Envelope className="text-primary me-2" size={24} />
                <h2 className="h4 mb-0">Email Support</h2>
              </div>
              <p className="mb-4">
                For general inquiries, technical support, or collaboration opportunities, 
                please contact us directly:
              </p>
              <div className="text-center">
                <Button
                  variant="primary"
                  size="lg"
                  href="mailto:ales.varabyou@jhu.edu"
                  className="px-4"
                >
                  <Envelope className="me-2" />
                  ales.varabyou@jhu.edu
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <Github className="text-primary me-2" size={24} />
                <h2 className="h4 mb-0">GitHub Issues</h2>
              </div>
              <p className="mb-4">
                Found a bug, have a feature request, or want to contribute to the project? 
                Please use our GitHub repository to report issues you encounter with either 
                the web interface or the data.
              </p>
              <div className="text-center">
                <Button
                  variant="outline-primary"
                  size="lg"
                  href="https://github.com/alevar/CHESS_WEB/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4"
                >
                  <Github className="me-2" />
                  View GitHub Issues
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactUs;