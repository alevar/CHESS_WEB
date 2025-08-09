import React, { useRef } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useDbData, useSelectedOrganism, useSelectedAssembly } from '../../hooks/useGlobalData';
import GenomeBrowserComponent from '../../components/genomeBrowser/GenomeBrowser';
import './GenomeBrowser.css';
import Sidebar from '../../components/common/Sidebar/Sidebar';

const GenomeBrowser: React.FC = () => {
  const dbData = useDbData();
  const organism = useSelectedOrganism();
  const assembly = useSelectedAssembly();
  const browserRef = useRef<any>(null);

  return (
    <Container className="py-5">
      <Row>
        <Col xs={12} md={3} lg={3} className="mb-4 mb-md-0">
          <Sidebar title="Genome Tools">
            <div>Sidebar content for genome browser.</div>
          </Sidebar>
        </Col>
        <Col xs={12} md={9} lg={9}>
          {dbData.loading ? (
            <Alert variant="info">
              <Alert.Heading>Loading Data</Alert.Heading>
              <p>Please wait while we load the genome data...</p>
            </Alert>
          ) : dbData.error ? (
            <Alert variant="danger">
              <Alert.Heading>Error Loading Data</Alert.Heading>
              <p>{dbData.error}</p>
            </Alert>
          ) : !organism || !assembly ? (
            <Alert variant="warning">
              <Alert.Heading>No Genome Selected</Alert.Heading>
              <p>Please select an organism and assembly using the dropdown in the header.</p>
            </Alert>
          ) : (
            <Card>
              <Card.Body className="p-0">
                <div className="genome-browser-wrapper">
                  <GenomeBrowserComponent 
                    ref={browserRef}
                  />
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default GenomeBrowser; 