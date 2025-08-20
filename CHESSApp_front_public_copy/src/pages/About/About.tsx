import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const About: React.FC = () => (
  <Container className="mt-5">
    <Row>
      <Col lg={10} className="mx-auto">
        <h1 className="mb-4">About the CHESS Project</h1>
        
        <Card className="mb-4">
          <Card.Body>
            <h3>What is CHESS?</h3>
            <p>
              CHESS represents an improved human gene catalog based on nearly 10,000 RNA-seq experiments 
              across 54 body sites. It significantly improves current genome annotation by integrating the 
              latest reference data and algorithms, machine learning techniques for noise filtering, and 
              new protein structure prediction methods.
            </p>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body>
            <h3>Key Features</h3>
            <h5>The current release of CHESS includes:</h5>
            <ul>
              <li><strong>41,356 genes</strong> including 19,839 protein-coding genes</li>
              <li><strong>158,377 transcripts</strong> with direct experimental evidence</li>
              <li><strong>14,863 protein-coding transcripts</strong> not found in other catalogs</li>
              <li><strong>All MANE transcripts</strong> included for clinical relevance</li>
              <li><strong>Protein structure predictions</strong> for &gt;95% of all proteins using AlphaFold2</li>
              <li><strong>CHM13 genome support</strong> with 129 additional protein-coding genes</li>
            </ul>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body>
            <h3>Methodology</h3>
            <p>
              Unlike other gene catalogs, CHESS is built primarily on direct experimental evidence from 
              RNA sequencing experiments, particularly the large-scale GTEx project. We use strict 
              filtering criteria to remove transcriptional noise and non-functional transcripts, 
              ensuring high-quality annotations supported by machine learning and protein structure validation.
            </p>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Body>
            <h3>Quality and Validation</h3>
            <p>
              CHESS 3 takes a conservative approach, excluding aberrant transcripts and non-functional 
              proteins that may confuse analysis software. We employ protein structure prediction via 
              AlphaFold2 to validate the functionality of annotated proteins, making CHESS the only 
              human annotation database to include 3D structure predictions for most proteins.
            </p>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <h3>Access and Availability</h3>
            <p>
              CHESS 3 is freely available and provides annotations for both the GRCh38 and CHM13 
              reference genomes. All protein structures can be accessed at{' '}
              <a href="https://isoform.io" target="_blank" rel="noopener noreferrer">isoform.io</a>.
            </p>
            <p className="mb-0">
              <strong>Learn more:</strong>{' '}
              <a href="http://ccb.jhu.edu/chess" target="_blank" rel="noopener noreferrer">
                http://ccb.jhu.edu/chess
              </a>
            </p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default About;
