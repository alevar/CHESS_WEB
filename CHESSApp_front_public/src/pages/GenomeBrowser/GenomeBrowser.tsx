import React, { useRef } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import GenomeBrowserComponent from '../../components/genomeBrowser/GenomeBrowser';
import GeneSearchBox from '../../components/genomeBrowser/GeneSearchBox';
import { get_organism, get_assembly } from '../../types/db';
import './GenomeBrowser.css';
import Sidebar from '../../components/common/Sidebar/Sidebar';

const GenomeBrowser: React.FC = () => {
  const global = useSelector((state: RootState) => state.global);
  const organism = global.data ? get_organism(global.data, global.settings.organism_id) : null;
  const assembly = global.data ? get_assembly(global.data, global.settings.assembly_id) : null;
  const browserRef = useRef<any>(null);

  const handleGeneSelect = (region: string) => {
    const viewState = browserRef.current?.getViewState?.();
    if (viewState && viewState.session?.view?.navToLocString) {
      viewState.session.view.navToLocString(region);
    }
  };

  return (
    <Container className="py-5">
      <Row>
        <Col xs={12} md={3} lg={3} className="mb-4 mb-md-0">
          <Sidebar title="Genome Tools">
            <div>Sidebar content for genome browser.</div>
          </Sidebar>
        </Col>
        <Col xs={12} md={9} lg={9}>
          <GeneSearchBox
            genome={global.settings.assembly_id}
            onGeneSelect={handleGeneSelect}
          />
          {!global.data ? (
            <Alert variant="info">
              <Alert.Heading>Loading Data</Alert.Heading>
              <p>Please wait while we load the genome data...</p>
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
                  <GenomeBrowserComponent ref={browserRef} />
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