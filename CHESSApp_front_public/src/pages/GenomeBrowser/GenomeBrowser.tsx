import React, { useRef, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useDbData, useSelectedOrganism, useSelectedAssembly, useAppData } from '../../redux/hooks';
import { useLocation } from 'react-router-dom';
import GenomeBrowserComponent from '../../components/genomeBrowser/GenomeBrowser';
import TrackManager from '../../components/genomeBrowser/TrackManager';
import { TrackConfig } from '../../components/genomeBrowser/tracks';
import Sidebar from '../../components/common/Sidebar/Sidebar';

const GenomeBrowser: React.FC = () => {
  const dbData = useDbData();
  const organism = useSelectedOrganism();
  const assembly = useSelectedAssembly();
  const appData = useAppData();
  const location = useLocation();
  const browserRef = useRef<any>(null);
  const [currentTracks, setCurrentTracks] = useState<TrackConfig[]>([]);
  
  // Get location from navigation state (passed from gene search)
  const geneLocation = location.state?.location;
  const geneName = location.state?.geneName;

  const handleTracksChange = (newTracks: TrackConfig[]) => {
    setCurrentTracks(newTracks);
  };

  return (
    <Container className="py-5">
      <Row>
        <Col xs={12} md={3} lg={3} className="mb-4 mb-md-0">
          <Sidebar title="Track Management">
            <TrackManager
              currentTracks={currentTracks}
              onTracksChange={handleTracksChange}
              currentAssembly={assembly?.assembly_id || 0}
              currentNomenclature={appData.selections.nomenclature || ''}
            />
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
            <>
              <GenomeBrowserComponent 
                ref={browserRef}
                currentTracks={currentTracks}
                onTracksChange={handleTracksChange}
                initialLocation={geneLocation}
              />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default GenomeBrowser; 