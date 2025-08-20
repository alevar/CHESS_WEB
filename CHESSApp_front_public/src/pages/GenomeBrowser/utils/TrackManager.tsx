import React, { useState } from 'react';
import { Card, ListGroup, Container, Row, Col } from 'react-bootstrap';
import { useDbData } from '../../../hooks';
import { Source, SourceVersion, SourceVersionAssembly } from '../../../types/dbTypes';

export interface TrackConfig {
  trackId: string;
  name: string;
  source_id: number;
  sv_id: number;
  sva_id: number;
  nomenclature: string;
  colorScheme: string;
}

interface TrackManagerProps {
  currentTracks: TrackConfig[];
  onTracksChange: (tracks: TrackConfig[]) => void;
  currentAssembly: number;
  currentNomenclature: string;
}

const TrackManager: React.FC<TrackManagerProps> = ({
  currentTracks,
  onTracksChange,
  currentAssembly: currentAssembly_ID,
  currentNomenclature
}) => {
  const dbDataHook = useDbData();
  const sources = dbDataHook.getAllSourcesForAssembly_byID(currentAssembly_ID);
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);

  // Color schemes for tracks
  const colorSchemes = [
    'Orange/Green/Red',
    'Blue/Light Red/Light Green',
    'Purple/Orange/Teal',
    'Brown/Pink/Gray',
    'Red/Blue/Green',
    'Orange/Purple/Green'
  ];

  // Check if version is selected as track
  const isVersionSelected = (sourceId: number, svId: number): boolean => {
    return currentTracks.some(track => track.source_id === sourceId && track.sv_id === svId);
  };

  // Add track
  const addTrack = (source: Source, version: SourceVersion): void => {
    const sva = Object.values(version.assemblies || {}).find((sva: SourceVersionAssembly) => 
      sva.assembly_id === currentAssembly_ID
    );

    const newTrack: TrackConfig = {
      trackId: `track-${source.source_id}-${version.sv_id}`,
      name: `${source.name} - ${version.version_name}`,
      source_id: source.source_id,
      sv_id: version.sv_id,
      sva_id: sva?.sva_id || 0,
      nomenclature: currentNomenclature,
      colorScheme: colorSchemes[currentTracks.length % colorSchemes.length]
    };

    onTracksChange([...currentTracks, newTrack]);
  };

  // Remove track
  const removeTrack = (sourceId: number, svId: number): void => {
    onTracksChange(currentTracks.filter(track => 
      !(track.source_id === sourceId && track.sv_id === svId)
    ));
  };

  // Render track action button
  const renderTrackAction = (source: Source, version: SourceVersion) => {
    const isSelected = isVersionSelected(source.source_id, version.sv_id);
    const trackId = `track-${source.source_id}-${version.sv_id}`;
    const isHovered = hoveredTrackId === trackId;
  
    if (isSelected) {
      return isHovered ? (
        <button
          onClick={() => removeTrack(source.source_id, version.sv_id)}
          style={{ 
            background: 'none',
            border: 'none',
            padding: '0',
            cursor: 'pointer',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="text-danger"
        >
          <i className="bi bi-dash-circle" style={{ fontSize: '18px' }}></i>
        </button>
      ) : (
        <div 
          className="d-flex align-items-center justify-content-center"
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '18px' }}></i>
        </div>
      );
    }
  
    return (
      <button
        onClick={() => addTrack(source, version)}
        style={{ 
          background: 'none',
          border: 'none',
          padding: '0',
          cursor: 'pointer',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="text-primary"
      >
        <i className="bi bi-plus-circle" style={{ fontSize: '18px' }}></i>
      </button>
    );
  };

  if (sources.length === 0) {
    return (
      <Container className="py-4">
        <div className="text-muted text-center">
          No sources available for current assembly
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="px-0">
      {sources.map((source: Source) => {
        const versions = dbDataHook.getAllVersionsForSourceAssembly_byID(source.source_id, currentAssembly_ID);
        // sort versions by version_rank
        versions.sort((a: SourceVersion, b: SourceVersion) => a.version_rank - b.version_rank);
        
        return (
          <Card key={source.source_id} className="mb-3">
            <Card.Header className="py-2">
              <Row className="align-items-center">
                <Col>
                  <div className="fw-medium">{source.name}</div>
                  <small className="text-muted">
                    {versions.length} version{versions.length !== 1 ? 's' : ''} available
                  </small>
                </Col>
              </Row>
            </Card.Header>
            
            <ListGroup variant="flush">
              {versions.map((version: SourceVersion) => {
                const trackId = `track-${source.source_id}-${version.sv_id}`;
                
                return (
                  <ListGroup.Item 
                    key={version.sv_id}
                    className="py-2"
                    onMouseEnter={() => setHoveredTrackId(trackId)}
                    onMouseLeave={() => setHoveredTrackId(null)}
                  >
                    <Row className="align-items-center">
                      <Col>
                        <span className="text-dark">{version.version_name}</span>
                      </Col>
                      <Col xs="auto">
                        {renderTrackAction(source, version)}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>
        );
      })}
    </Container>
  );
};

export default TrackManager;