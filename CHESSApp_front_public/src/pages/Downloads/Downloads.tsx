import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAppData, useSelectedOrganism, useSelectedAssembly, useSelectedSource, useSelectedVersion, useSelectedNomenclature } from '../../hooks/useGlobalData';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchDownloadFiles, downloadFile } from '../../redux/dbData';
import { DownloadFile } from '../../redux/dbData';

import './Downloads.css';

const Downloads: React.FC = () => {
  const dispatch = useAppDispatch();
  const appData = useAppData();
  const organism = useSelectedOrganism();
  const assembly = useSelectedAssembly();
  const source = useSelectedSource();
  const version = useSelectedVersion();
  const selectedNomenclature = useSelectedNomenclature();

  // Get downloads state from Redux
  const { files: availableFiles, loading, error, lastUpdated } = useAppSelector((state) => state.downloads);

  // Update when selections change
  useEffect(() => {
    if (assembly && selectedNomenclature) {
      dispatch(fetchDownloadFiles({ 
        assembly_id: assembly.assembly_id, 
        assembly_name: assembly.assembly_name,
        nomenclature: selectedNomenclature,
        source,
        version
      }));
    } else if (assembly && !selectedNomenclature) {
      // Clear downloads if no nomenclature is selected
      dispatch({ type: 'downloads/clearDownloads' });
    }
  }, [assembly, selectedNomenclature, source, version, dispatch]);

  const handleFileDownload = async (file: DownloadFile) => {
    try {
      await dispatch(downloadFile(file)).unwrap();
      // Download started successfully
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'fasta':
        return 'bi bi-file-earmark-text text-primary';
      case 'gtf.gz':
      case 'gff3.gz':
        return 'bi bi-file-earmark-text text-success';
      case 'fai':
        return 'bi bi-file-earmark-text text-warning';
      default:
        return 'bi bi-file-earmark text-muted';
    }
  };

  const getFileTypeBadge = (type: string) => {
    const variant = type === 'fasta' ? 'primary' : 
                   type === 'gtf.gz' || type === 'gff3.gz' ? 'success' : 
                   type === 'fai' ? 'warning' : 'secondary';
    
    return <Badge bg={variant}>{type.toUpperCase()}</Badge>;
  };

  if (!assembly) {
    return (
      <Container className="py-4">
        <Row>
          <Col>
            <Alert variant="info">
              <Alert.Heading>
                <i className="bi bi-info-circle me-2"></i>
                Select Assembly
              </Alert.Heading>
              <p className="mb-0">
                Please select an assembly from the navigation to view available downloads.
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!selectedNomenclature) {
    return (
      <Container className="py-4">
        <Row>
          <Col>
            <Alert variant="warning">
              <Alert.Heading>
                <i className="bi bi-exclamation-triangle me-2"></i>
                Select Nomenclature
              </Alert.Heading>
              <p className="mb-0">
                Please select a nomenclature from the navigation to view available downloads.
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-download me-2"></i>
                Downloads
              </h2>
              <p className="text-muted mb-0">
                Download genome data for {assembly.assembly_name}
                {source && ` - ${source.name}`}
                {version && ` (${version.version_name})`}
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">Last Updated</small>
              <span className="fw-medium">
                {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Current Selection Summary */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h6 className="mb-3">
                <i className="bi bi-gear me-2"></i>
                Current Selection
              </h6>
              <Row>
                <Col md={3}>
                  <div className="mb-2">
                    <small className="text-muted d-block">Organism</small>
                    <span className="fw-medium">{organism?.scientific_name || 'Not selected'}</span>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-2">
                    <small className="text-muted d-block">Assembly</small>
                    <span className="fw-medium">{assembly.assembly_name}</span>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-2">
                    <small className="text-muted d-block">Source</small>
                    <span className="fw-medium">{source?.name || 'Not selected'}</span>
                  </div>
                </Col>
                <Col md={3}>
                  <div className="mb-2">
                    <small className="text-muted d-block">Version</small>
                    <span className="fw-medium">{version?.version_name || 'Not selected'}</span>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <div className="mb-2">
                    <small className="text-muted d-block">Nomenclature</small>
                    <span className="fw-medium">{selectedNomenclature}</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Files */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-files me-2" style={{ fontSize: '20px' }}></i>
                Available Files
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="d-flex justify-content-center p-4">
                  <Spinner animation="border" />
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">
                  <Alert.Heading>Error Loading Files</Alert.Heading>
                  <p className="mb-0">{error}</p>
                </Alert>
              ) : availableFiles.length === 0 ? (
                <div className="text-center p-4">
                  <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">No files available for the current selection</p>
                </div>
              ) : (
                <Table responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>File</th>
                      <th>Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableFiles.map((file) => (
                      <tr key={file.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className={getFileTypeIcon(file.type)} style={{ fontSize: '1.2rem' }}></i>
                            <div className="ms-3">
                              <div className="fw-medium">{file.name}</div>
                              <small className="text-muted">{file.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>{getFileTypeBadge(file.type)}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleFileDownload(file)}
                          >
                            <i className="bi bi-download me-1"></i>
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Downloads;