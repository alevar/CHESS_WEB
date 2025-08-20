import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import jhu_logo from '../../../assets/logos/university.shield.blue.svg';
import som_logo from '../../../assets/logos/medicine.shield.blue.svg';
import sph_logo from '../../../assets/logos/bloomberg.shield.blue.svg';

const Footer: React.FC = () => {
  return (
    <div className="bg-light border-top mt-auto">
      <footer className="py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={1} className="mb-3 mb-md-0">
              <a href="https://engineering.jhu.edu/" className="d-flex align-items-center">
                <img src={jhu_logo} alt="JHU Engineering Logo" className="img-fluid" style={{ maxHeight: '40px' }} />
              </a>
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <p className="text-muted mb-0">CCB &copy; {new Date().getFullYear()}</p>
            </Col>
            <Col md={4} className="text-center mb-3 mb-md-0">
              
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <a href="https://github.com/alevar/CHESS_WEB/blob/main/LICENSE" className="text-muted text-decoration-none ms-1">License</a>
            </Col>
            <Col md={1} className="mb-3 mb-md-0">
              <a href="https://www.hopkinsmedicine.org/som/" className="d-flex align-items-center">
                <img src={som_logo} alt="SOM Logo" className="img-fluid" style={{ maxHeight: '40px' }} />
              </a>
            </Col>
            <Col md={1} className="text-end">
              <a href="https://publichealth.jhu.edu/" className="d-flex align-items-center justify-content-end">
                <img src={sph_logo} alt="SPH Logo" className="img-fluid" style={{ maxHeight: '40px' }} />
              </a>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Footer;