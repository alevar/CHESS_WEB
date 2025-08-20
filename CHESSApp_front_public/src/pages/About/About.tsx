import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const About: React.FC = () => {
  return (
    <Container className="py-5">
      <Row>
        <Col lg={10} xl={8} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold mb-3">About the CHESS Project</h1>
            <p className="lead text-muted">
              An improved human gene catalog based on comprehensive RNA-seq analysis
            </p>
          </div>

          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h3 mb-3">What is CHESS?</h2>
              <p className="mb-0">
                CHESS represents an improved human gene catalog based on nearly 10,000 RNA-seq experiments 
                across 54 body sites. It significantly improves current genome annotation by integrating the 
                latest reference data and algorithms, machine learning techniques for noise filtering, and 
                new protein structure prediction methods.
              </p>
            </Card.Body>
          </Card>

          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h3 mb-4">Key Features</h2>
              <p className="mb-4">The current release of CHESS includes:</p>
              
              <Row className="g-3 mb-4">
                <Col sm={6} lg={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <div className="display-6 fw-bold text-primary">41,356</div>
                    <small className="text-muted">genes including 19,839 protein-coding genes</small>
                  </div>
                </Col>
                <Col sm={6} lg={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <div className="display-6 fw-bold text-primary">158,377</div>
                    <small className="text-muted">transcripts with direct experimental evidence</small>
                  </div>
                </Col>
                <Col sm={6} lg={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <div className="display-6 fw-bold text-primary">14,863</div>
                    <small className="text-muted">protein-coding transcripts not found in other catalogs</small>
                  </div>
                </Col>
                <Col sm={6} lg={3}>
                  <div className="text-center p-3 bg-light rounded">
                    <div className="display-6 fw-bold text-primary">&gt;95%</div>
                    <small className="text-muted">protein structure predictions using AlphaFold2</small>
                  </div>
                </Col>
              </Row>

              <Row className="g-3">
                <Col md={6}>
                  <div className="p-3 border-start border-primary border-3 bg-light">
                    <strong>All MANE transcripts</strong> included for clinical relevance
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border-start border-primary border-3 bg-light">
                    <strong>CHM13 genome support</strong> with 129 additional protein-coding genes
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h3 mb-3">Methodology</h2>
              <p className="mb-0">
                Unlike other gene catalogs, CHESS is built primarily on direct experimental evidence from 
                RNA sequencing experiments, particularly the large-scale GTEx project. We use strict 
                filtering criteria to remove transcriptional noise and non-functional transcripts, 
                ensuring high-quality annotations supported by machine learning and protein structure validation.
              </p>
            </Card.Body>
          </Card>

          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h3 mb-3">Quality and Validation</h2>
              <p className="mb-0">
                CHESS 3 takes a conservative approach, excluding aberrant transcripts and non-functional 
                proteins that may confuse analysis software. We employ protein structure prediction via 
                AlphaFold2 to validate the functionality of annotated proteins, making CHESS the only 
                human annotation database to include 3D structure predictions for most proteins.
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h2 className="h3 mb-3">Access and Availability</h2>
              <p>
                CHESS 3 is freely available and provides annotations for both the GRCh38 and CHM13 
                reference genomes. All protein structures can be accessed at{' '}
                <a 
                  href="https://isoform.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  isoform.io
                </a>.
              </p>
              <div className="alert alert-info mb-0">
                <strong>Learn more:</strong>{' '}
                <a 
                  href="http://ccb.jhu.edu/chess" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  http://ccb.jhu.edu/chess
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;