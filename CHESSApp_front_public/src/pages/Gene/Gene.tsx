import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppSelections, useSelectedAssembly, useDbData, useCurrentGene, useGeneLoading, useGeneError, useAppDispatch, usePDBDownloading } from '../../redux/hooks';
import { fetchGeneByGid, clearGeneData } from '../../redux/gene';
import TranscriptVisualization from '../../components/TranscriptVisualization';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import PDBViewer from '../../components/PDBViewer';
import { downloadPDBFile } from '../../redux/pdb/pdbThunks';
import './Gene.css';

const Gene: React.FC = () => {
  const navigate = useNavigate();
  const { gid } = useParams<{ gid: string }>();
  const dispatch = useAppDispatch();
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);
  
  // Redux state
  const geneData = useCurrentGene();
  const loading = useGeneLoading();
  const error = useGeneError();
  const appSelections = useAppSelections();
  const currentAssembly = useSelectedAssembly();
  const dbData = useDbData();

  // Fetch gene data when component mounts or gid changes
  useEffect(() => {
    if (gid) {
      const numericGid = parseInt(gid, 10);
      if (!isNaN(numericGid)) {
        dispatch(fetchGeneByGid(numericGid));
      }
    }
    
    // Cleanup when component unmounts
    return () => {
      dispatch(clearGeneData());
    };
  }, [gid, dispatch]);


  // Helper function to get sequence name from sequence_id using current nomenclature
  const getSequenceName = (sequenceId: string): string => {
    if (!currentAssembly || !appSelections.nomenclature) {
      return sequenceId; // Fallback to sequence_id if no mapping available
    }

    const sequenceMappings = currentAssembly.sequence_id_mappings;
    if (sequenceMappings && sequenceMappings[sequenceId]) {
      const nomenclatureMappings = sequenceMappings[sequenceId].nomenclatures;
      if (nomenclatureMappings && nomenclatureMappings[appSelections.nomenclature]) {
        return nomenclatureMappings[appSelections.nomenclature];
      }
    }

    return sequenceId; // Fallback to sequence_id if no mapping found
  };

  // Helper function to get formatted source/version/assembly string from sva_id
  const getFormattedSourceInfo = (svaId: number): string => {
    if (!dbData.sources) {
      return `SVA ID: ${svaId}`; // Fallback if no source data
    }

    // Search through all sources to find the one containing this sva_id
    for (const source of Object.values(dbData.sources)) {
      if (source.versions) {
        for (const version of Object.values(source.versions)) {
          if (version.assemblies && version.assemblies[svaId]) {
            const assembly = version.assemblies[svaId];
            
            // Get organism and assembly names
            let organismName = 'Unknown Organism';
            let assemblyName = 'Unknown Assembly';
            
            if (dbData.organisms && dbData.assemblies) {
              // Find organism by taxonomy_id from assembly
              const assemblyData = dbData.assemblies[assembly.assembly_id];
              if (assemblyData) {
                for (const organism of Object.values(dbData.organisms)) {
                  if (organism.taxonomy_id === assemblyData.taxonomy_id) {
                    organismName = organism.scientific_name;
                    break;
                  }
                }
                assemblyName = assemblyData.assembly_name;
              }
            }

            // Get nomenclature from current selection or use a default
            const nomenclature = appSelections.nomenclature || 'Unknown';
            
            return `${organismName}/${assemblyName} (${nomenclature})/${source.name} (${version.version_name})`;
          }
        }
      }
    }

    return `SVA ID: ${svaId}`; // Fallback if not found
  };

  // Show loading state
  if (loading) {
    return (
      <Container className="py-5">
        <Row>
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading gene data...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container className="py-5">
        <Row>
          <Col>
            <Alert variant="danger">
              <Alert.Heading>Error Loading Gene Data</Alert.Heading>
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/explore')}
              >
                Back to Gene Search
              </button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // If no gene data, show error
  if (!geneData) {
    return (
      <Container className="py-5">
        <Row>
          <Col>
            <Alert variant="warning">
              <Alert.Heading>No Gene Data</Alert.Heading>
              <p>No gene information was provided. Please return to the gene search and try again.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/explore')}
              >
                Back to Gene Search
              </button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  // Calculate gene-level information from transcripts
  const geneCoordinates = geneData.transcripts.length > 0 ? {
    sequence_id: geneData.transcripts[0].sequence_id.toString(),
    start: Math.min(...geneData.transcripts.map(t => t.coordinates.start)),
    end: Math.max(...geneData.transcripts.map(t => t.coordinates.end)),
    strand: geneData.transcripts[0].strand
  } : null;
  
  const transcriptCount = geneData.transcripts.length;
  const sequenceName = geneCoordinates ? getSequenceName(geneCoordinates.sequence_id) : 'Unknown';
  const formattedSourceInfo = getFormattedSourceInfo(geneData.sva_id);

  // Handle transcript selection
  const handleTranscriptClick = (transcript: any | null) => {
    setSelectedTranscript(transcript);
  };



  // PDB Entry Component (can use hooks)
  const PDBEntry = ({ entry, entryIndex, dataset }: { entry: any; entryIndex: number; dataset: any }) => {
    const isDownloading = usePDBDownloading(entry.td_id);
    
    const handleDownload = async () => {
      console.log("handleDownload", entry.td_id);
      try {
        await dispatch(downloadPDBFile(entry.td_id)).unwrap();
        // Download started successfully - no need for success message since it's a file download
      } catch (error) {
        console.error('PDB download failed:', error);
        alert(`PDB download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
  
    return (
      <div className="pdb-entry mb-3">
        <div className="entry-actions">
          <button 
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <i className={`bi ${isDownloading ? 'bi-hourglass-split' : 'bi-download'} me-1`}></i>
            {isDownloading ? 'Downloading...' : 'Download PDB'}
          </button>
        </div>
        
        <PDBViewer
          td_id={entry.td_id}
          width={600}
          height={500}
          title={`${dataset.dataset_name} - ${entry.td_id || `Entry ${entryIndex + 1}`}`}
        />
      </div>
    );
  };



  return (
    <div className="gene-page">
      <Container className="py-5">
        <Row>
          <Col xs={12} md={3} lg={3} className="mb-4 mb-md-0">
            <Sidebar title="">
              <div className="gene-quicklinks">
                <div className="quicklink-item mb-3">
                  <a href="#gene-info" className="quicklink-link">
                    <i className="bi bi-info-circle me-2"></i>
                    Gene Information
                  </a>
                </div>
                <div className="quicklink-item mb-3">
                  <a href="#transcript-viz" className="quicklink-link">
                    <i className="bi bi-graph-up me-2"></i>
                    Transcript Visualization
                  </a>
                </div>
                {selectedTranscript && (
                  <>
                    <div className="quicklink-item mb-3">
                      <a href="#transcript-details" className="quicklink-link">
                        <i className="bi bi-file-text me-2"></i>
                        Selected Transcript
                      </a>
                    </div>
                    
                    {/* Dataset Quicklinks */}
                    {selectedTranscript.datasets.length > 0 && (
                      <>
                        <div className="quicklink-item mb-2">
                          <h6 className="text-muted mb-2 small">Datasets:</h6>
                        </div>
                        {selectedTranscript.datasets.map((dataset: any, index: number) => (
                          <div key={index} className="quicklink-item mb-2">
                            <a href={`#dataset-${index}`} className="quicklink-link dataset-link">
                              <i className={`bi ${dataset.data_type === 'pdb' ? 'bi-cube-fill text-primary' : 'bi-database'} me-2`}></i>
                                                              <span className="small">
                                  {dataset.dataset_name}
                                </span>
                            </a>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
                
                <hr className="my-4" />
                
                <div className="quicklink-item mb-3">
                  <button 
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => {
                      navigate('/browser', { 
                        state: { 
                          location: `${sequenceName}:${geneCoordinates ? `${geneCoordinates.start}-${geneCoordinates.end}` : 'Unknown'}`,
                          geneName: geneData.name,
                          geneId: geneData.gene_id
                        }
                      });
                    }}
                  >
                    <i className="bi bi-eye me-2"></i>
                    View in Browser
                  </button>
                </div>
              </div>
            </Sidebar>
          </Col>
          
          <Col xs={12} md={9} lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="mb-2">{geneData.name}</h1>
                <p className="text-muted mb-0">Gene ID: {geneData.gene_id}</p>
              </div>
            </div>

          <Row>
            <Col>
              <Card className="mb-4" id="gene-info">
                <Card.Header>
                  <h4>Gene Information</h4>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Gene Name:</strong> {geneData.name}
                      </div>
                      <div className="mb-3">
                        <strong>Gene ID:</strong> <code>{geneData.gene_id}</code>
                      </div>
                      <div className="mb-3">
                        <strong>Type:</strong> 
                        <span className="badge bg-secondary ms-2">{geneData.gene_type}</span>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Transcript Count:</strong> 
                        <span className="badge bg-info ms-2">{transcriptCount}</span>
                      </div>
                      <div className="mb-3">
                        <strong>Source:</strong> {formattedSourceInfo}
                      </div>
                      <div className="mb-3">
                        <strong>Coordinates:</strong> 
                        <code className="ms-2 bg-light p-2 rounded">
                          {sequenceName}:{geneCoordinates ? `${geneCoordinates.start}-${geneCoordinates.end}` : 'Unknown'}
                        </code>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

          </Row>

          {/* Transcript Visualization */}
          <Row id="transcript-viz">
            <Col>
              <TranscriptVisualization
                transcripts={geneData.transcripts}
                geneCoordinates={geneCoordinates}
                onTranscriptClick={handleTranscriptClick}
                selectedTranscript={selectedTranscript} // Add this line
              />
            </Col>
          </Row>

          {/* Selected Transcript Information */}
          {selectedTranscript && (
            <Row id="transcript-details">
              <Col>
                <Card className="mb-4">
                  <Card.Header>
                    <h5>Selected Transcript</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>Transcript ID:</strong> <code>{selectedTranscript.transcript_id}</code>
                        </div>
                        <div className="mb-3">
                          <strong>Type:</strong> 
                          <span className="badge bg-secondary ms-2">{selectedTranscript.transcript_type}</span>
                        </div>
                        <div className="mb-3">
                          <strong>Coordinates:</strong> 
                          <code className="ms-2 bg-light p-2 rounded">
                            {selectedTranscript.coordinates.start.toLocaleString()}-{selectedTranscript.coordinates.end.toLocaleString()}
                          </code>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>Exons:</strong> 
                          <span className="badge bg-info ms-2">{selectedTranscript.exons.length}</span>
                        </div>
                        <div className="mb-3">
                          <strong>CDS Regions:</strong> 
                          <span className="badge bg-primary ms-2">{selectedTranscript.cds.length}</span>
                        </div>
                        <div className="mb-3">
                          <strong>Datasets:</strong> 
                          <span className="badge bg-warning ms-2">{selectedTranscript.datasets.length}</span>
                        </div>
                      </Col>
                    </Row>
                    
                    {/* Exon Details */}
                    {selectedTranscript.exons.length > 0 && (
                      <div className="mt-3">
                        <h6>Exon Details:</h6>
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Exon #</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Length</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTranscript.exons.map((exon: [number, number], index: number) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{exon[0].toLocaleString()}</td>
                                  <td>{exon[1].toLocaleString()}</td>
                                  <td>{(exon[1] - exon[0] + 1).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Individual Dataset Sections */}
                    {selectedTranscript.datasets.length > 0 && (
                      <div className="mt-4">
                        <h6 className="mb-3">Available Datasets:</h6>
                        {selectedTranscript.datasets.map((dataset: any, index: number) => (
                          <div key={index} id={`dataset-${index}`} className="mb-4">
                            <Card className="dataset-card">
                              <Card.Header className="dataset-header">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h6 className="mb-1">{dataset.dataset_name}</h6>
                                    <p className="mb-0 text-muted small">{dataset.dataset_description}</p>
                                  </div>
                                  <div className="dataset-badges">
                                    <span className="badge bg-secondary me-2">{dataset.data_type}</span>
                                    <span className="badge bg-info">{dataset.data_entries.length} entries</span>
                                  </div>
                                </div>
                              </Card.Header>
                              <Card.Body>
                                <div className="dataset-content">
                                  {/* PDB Viewer for PDB data types */}
                                  {dataset.data_type === 'pdb' && dataset.data_entries.length > 0 ? (
                                    <div className="pdb-dataset-view">
                                      {dataset.data_entries.map((entry: any, entryIndex: number) => (
                                        <PDBEntry 
                                          key={entryIndex} 
                                          entry={entry} 
                                          entryIndex={entryIndex} 
                                          dataset={dataset} 
                                        />
                                      ))}
                                    </div>
                                  ) : dataset.data_entries.length > 0 ? (
                                    /* Regular data table for non-PDB types */
                                    <div className="table-responsive">
                                      <table className="table table-sm table-hover">
                                        <thead>
                                          <tr>
                                            <th>Entry ID</th>
                                            <th>Data Value</th>
                                            <th>Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {dataset.data_entries.map((entry: any, entryIndex: number) => (
                                            <tr key={entryIndex}>
                                              <td>
                                                <code className="small">{entry.td_id || `Entry ${entryIndex + 1}`}</code>
                                              </td>
                                              <td>
                                                <span className="data-value">{entry.data}</span>
                                              </td>
                                              <td>
                                                <button className="btn btn-outline-primary btn-sm">
                                                  <i className="bi bi-eye me-1"></i>
                                                  View Details
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center text-muted py-3">
                                      <i className="bi bi-inbox display-6"></i>
                                      <p className="mt-2">No data entries available</p>
                                    </div>
                                  )}
                                </div>
                              </Card.Body>
                            </Card>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
        </Container>
      </div>
    );
};

export default Gene; 