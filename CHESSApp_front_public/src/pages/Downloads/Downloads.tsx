import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { Container, Row, Col, Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useDbData, useAppData, useDownloads } from '../../hooks';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { fetchDownloadFiles, downloadFile } from '../../redux/downloads/downloadsThunks';
import { DownloadFile } from '../../types/downloadsTypes';

const Downloads: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const dbDataHook = useDbData();
  const appDataHook = useAppData();
  const appData = appDataHook.getAppData();

  // Check loading states first
  if (dbDataHook.getDbData().loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center py-4">
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  if (dbDataHook.getDbData().error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Database Error</Alert.Heading>
          <p className="mb-0">{dbDataHook.getDbData().error}</p>
        </Alert>
      </Container>
    );
  }

  if (appData.loading || !appData.initialized) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center py-4">
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  if (appData.error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Application Error</Alert.Heading>
          <p className="mb-0">{appData.error}</p>
        </Alert>
      </Container>
    );
  }

  // Now safely access the data
  const organism = appData.selections.organism_id 
    ? dbDataHook.getOrganism(appData.selections.organism_id)
    : undefined;
  const assembly = appData.selections.assembly_id 
    ? dbDataHook.getAssembly(appData.selections.assembly_id)
    : undefined;
  const source = appData.selections.source_id 
    ? dbDataHook.getSource(appData.selections.source_id)
    : undefined;
  const version = appData.selections.version_id && appData.selections.source_id
    ? dbDataHook.getSourceVersion(appData.selections.source_id, appData.selections.version_id)
    : undefined;
  const nomenclature = appData.selections.nomenclature;

  const downloadsHook = useDownloads();
  const downloads = downloadsHook.getDownloads();

  useEffect(() => {
    // Only fetch downloads when we have the minimum required data
    if (assembly && nomenclature && !downloads.loading) {
      dispatch(fetchDownloadFiles({ 
        assembly_id: assembly.assembly_id, 
        assembly_name: assembly.assembly_name,
        nomenclature: nomenclature,
        source,
        version
      }));
    }
  }, [assembly, nomenclature, source, version, dispatch, downloads.loading]);

  const handleFileDownload = async (file: DownloadFile) => {
    try {
      await dispatch(downloadFile(file)).unwrap();
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

  // Check if required selections are missing
  if (!assembly) {
    return (
      <Container className="py-4">
        <Alert variant="info">
          <Alert.Heading>Select Assembly</Alert.Heading>
          <p className="mb-0">
            Please select an assembly from the navigation to view available downloads.
          </p>
        </Alert>
      </Container>
    );
  }

  if (!nomenclature) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <Alert.Heading>Select Nomenclature</Alert.Heading>
          <p className="mb-0">
            Please select a nomenclature from the navigation to view available downloads.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-1">Downloads</h2>
        </Col>
      </Row>

      {/* Current Selection */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Current Selection</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <small className="text-muted d-block">Organism</small>
                  <span className="fw-medium">{organism?.scientific_name || 'Not selected'}</span>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">Assembly</small>
                  <span className="fw-medium">{assembly.assembly_name}</span>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">Source</small>
                  <span className="fw-medium">{source?.name || 'Not selected'}</span>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">Version</small>
                  <span className="fw-medium">{version?.version_name || 'Not selected'}</span>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col md={3}>
                  <small className="text-muted d-block">Nomenclature</small>
                  <span className="fw-medium">{nomenclature}</span>
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
              <h5 className="mb-0">Available Files</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {downloads.loading ? (
                <div className="d-flex justify-content-center py-4">
                  <LoadingSpinner />
                </div>
              ) : downloads.error ? (
                <Alert variant="danger" className="m-3 mb-0">
                  <Alert.Heading>Error Loading Files</Alert.Heading>
                  <p className="mb-0">{downloads.error}</p>
                </Alert>
              ) : downloads.files.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No files available for the current selection</p>
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
                    {downloads.files.map((file) => (
                      <tr key={file.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className={getFileTypeIcon(file.type)}></i>
                            <div className="ms-2">
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