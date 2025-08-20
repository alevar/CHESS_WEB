import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import { useAppSelections, useSelectedAssembly, useDbData, useCurrentGene, useGeneLoading, useGeneError, useAppDispatch, useCurrentTranscript, useTranscriptLoading, useTranscriptError, useSecondaryTranscript, useSecondaryTranscriptLoading, useSecondaryTranscriptError } from '../../redux/hooks';
import { fetchGeneByGid, clearGeneData } from '../../redux/gene';
import { clearTranscriptData, clearSecondaryTranscriptData } from '../../redux/gene/transcriptIndex';
import { fetchTranscriptData } from '../../redux/gene/transcriptThunks';
import TranscriptVisualization from '../../components/TranscriptVisualization';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import PDBEntry from '../../components/PDBEntry';
import ExpressionBoxplot from '../../components/ExpressionBoxplot';
import './Gene.css';

// Define primary and secondary colors
const TRANSCRIPT_COLORS = {
  primary: {
    main: '#FF6B35',
    light: '#FF8A5B',
    lighter: '#FFE8E1',
    border: '#FF6B35'
  },
  secondary: {
    main: '#9C27B0',
    light: '#BA68C8',
    lighter: '#F3E5F5',
    border: '#9C27B0'
  }
};

const Gene: React.FC = () => {
  const navigate = useNavigate();
  const { gid } = useParams<{ gid: string }>();
  const dispatch = useAppDispatch();
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);
  const [selectedSecondaryTranscript, setSelectedSecondaryTranscript] = useState<any>(null);
  const [boxplotSortBy, setBoxplotSortBy] = useState<'median' | 'group' | 'mean' | 'count'>('median');
  const [boxplotSortOrder, setBoxplotSortOrder] = useState<'asc' | 'desc'>('desc');
  const [boxplotSortByTranscript, setBoxplotSortByTranscript] = useState<'primary' | 'secondary'>('primary');
  
  // Redux state
  const geneData = useCurrentGene();
  const loading = useGeneLoading();
  const error = useGeneError();
  const appSelections = useAppSelections();
  const currentAssembly = useSelectedAssembly();
  const dbData = useDbData();
  
  // Transcript state from Redux
  const fullTranscriptData = useCurrentTranscript();
  const transcriptLoading = useTranscriptLoading();
  const transcriptError = useTranscriptError();
  const secondaryTranscriptData = useSecondaryTranscript();
  const secondaryTranscriptLoading = useSecondaryTranscriptLoading();
  const secondaryTranscriptError = useSecondaryTranscriptError();

  // Determine if we have dual transcripts selected
  const isDualTranscriptMode = selectedTranscript && selectedSecondaryTranscript;

  // Function to merge boxplot datasets for comparison
  const mergeBoxplotDatasets = (primaryDataset: any, secondaryDataset: any) => {
    if (!primaryDataset && !secondaryDataset) return null;
    
    const primaryEntry = primaryDataset?.data_entries?.[0];
    const secondaryEntry = secondaryDataset?.data_entries?.[0];
    
    if (!primaryEntry && !secondaryEntry) return null;
    
    return {
      primaryData: primaryEntry?.data || '',
      secondaryData: secondaryEntry?.data || '',
      primaryTranscriptId: selectedTranscript?.transcript_id || 'Primary',
      secondaryTranscriptId: selectedSecondaryTranscript?.transcript_id || 'Secondary'
    };
  };

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
      dispatch(clearTranscriptData());
      dispatch(clearSecondaryTranscriptData());
    };
  }, [gid, dispatch]);

  // Monitor selectedTranscript changes and fetch data
  useEffect(() => {
    if (selectedTranscript && appSelections.assembly_id && appSelections.nomenclature) {
      dispatch(fetchTranscriptData({
        tid: selectedTranscript.tid,
        transcript_id: selectedTranscript.transcript_id,
        assembly_id: appSelections.assembly_id,
        nomenclature: appSelections.nomenclature,
        isSecondary: false
      }));
    } else if (!selectedTranscript) {
      dispatch(clearTranscriptData());
    }
  }, [selectedTranscript, appSelections.assembly_id, appSelections.nomenclature, dispatch]);

  // Monitor selectedSecondaryTranscript changes and fetch data
  useEffect(() => {
    if (selectedSecondaryTranscript && appSelections.assembly_id && appSelections.nomenclature) {
      dispatch(fetchTranscriptData({
        tid: selectedSecondaryTranscript.tid,
        transcript_id: selectedSecondaryTranscript.transcript_id,
        assembly_id: appSelections.assembly_id,
        nomenclature: appSelections.nomenclature,
        isSecondary: true
      }));
    } else if (!selectedSecondaryTranscript) {
      dispatch(clearSecondaryTranscriptData());
    }
  }, [selectedSecondaryTranscript, appSelections.assembly_id, appSelections.nomenclature, dispatch]);

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

  // Handle transcript selection
  const handleTranscriptClick = (transcript: any | null) => {
    setSelectedTranscript(transcript);
  };

  const handleSecondaryTranscriptClick = (transcript: any | null) => {
    setSelectedSecondaryTranscript(transcript);
  };

  // Component to render transcript header
  const renderTranscriptHeader = (transcript: any, isPrimary: boolean) => (
    <div className="d-flex align-items-center justify-content-between mb-3 p-3 rounded" 
         style={{
           backgroundColor: isPrimary ? TRANSCRIPT_COLORS.primary.lighter : TRANSCRIPT_COLORS.secondary.lighter,
           border: `2px solid ${isPrimary ? TRANSCRIPT_COLORS.primary.main : TRANSCRIPT_COLORS.secondary.main}`,
           borderRadius: '8px'
         }}>
      <div className="d-flex align-items-center">
        <span 
          className="badge me-3 px-3 py-2" 
          style={{ 
            backgroundColor: isPrimary ? TRANSCRIPT_COLORS.primary.main : TRANSCRIPT_COLORS.secondary.main,
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          {isPrimary ? 'Primary' : 'Secondary'}
        </span>
        <h5 className="mb-0 fw-bold" style={{ color: isPrimary ? TRANSCRIPT_COLORS.primary.main : TRANSCRIPT_COLORS.secondary.main }}>
          {transcript.transcript_id}
        </h5>
      </div>
      <div className="d-flex align-items-center gap-3">
        <span className="badge bg-secondary px-3 py-2">{transcript.transcript_type}</span>
        <code className="bg-white p-2 rounded border" style={{ fontSize: '0.85rem' }}>
          {getSequenceName(transcript.sequence_id.toString())}:{transcript.coordinates.start.toLocaleString()}-{transcript.coordinates.end.toLocaleString()}
        </code>
      </div>
    </div>
  );

  // Component to render loading/error states
  const renderTranscriptStatus = (isLoading: boolean, error: string | null) => (
    <>
      {isLoading && (
        <div className="text-center py-4 bg-light rounded border mb-3">
          <Spinner animation="border" size="sm" className="me-2 text-primary" />
          <span className="text-muted fw-medium">Loading transcript data...</span>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-3 border-0" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2 fs-5"></i>
            <div>
              <strong>Error loading transcript data:</strong>
              <div className="mt-1">{error}</div>
            </div>
          </div>
        </Alert>
      )}
    </>
  );

  // Component to render attributes section
  const renderAttributes = (transcriptData: any) => {
    if (!transcriptData) {
      return null;
    }
    
    return (
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
        {Object.entries(transcriptData.attributes).map(([key, value]) => (
          <div key={key} className="col">
            <div className="attribute-item p-3 border rounded h-100" 
                 style={{
                   backgroundColor: '#f8f9fa',
                   borderColor: '#dee2e6',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = '#e9ecef';
                   e.currentTarget.style.borderColor = '#adb5bd';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = '#f8f9fa';
                   e.currentTarget.style.borderColor = '#dee2e6';
                 }}>
              <div className="attribute-key small text-muted mb-2 fw-semibold text-uppercase" style={{ fontSize: '0.75rem' }}>
                {key}
              </div>
              <div className="attribute-value">
                <code className="small p-2 bg-white rounded border" style={{ fontSize: '0.8rem', wordBreak: 'break-word' }}>
                  {String(value)}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Component to render sequences section
  const renderSequences = (transcriptData: any) => {
    if (!transcriptData) {
      return null;
    }
    
    return (
      <div>
        {/* Nucleotide Sequence */}
        <div className="sequence-section mb-4">
          <div className="sequence-label mb-2">
            <span className="badge bg-primary px-3 py-2 me-2">
              <i className="bi bi-dna me-1"></i>
              DNA
            </span>
            <span className="fw-semibold">Nucleotide Sequence (Full Transcript)</span>
          </div>
          <div className="sequence-container sequence-type-nucleotide p-3 rounded border" 
               style={{ 
                 backgroundColor: '#f8f9fa',
                 borderColor: '#dee2e6',
                 maxHeight: '200px',
                 overflowY: 'auto'
               }}>
            <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
              {transcriptData.nt_sequence}
            </code>
          </div>
        </div>
        
        {/* CDS Sequence */}
        {transcriptData.cds_sequence && transcriptData.cds_sequence.trim() !== '' && (
          <div className="sequence-section mb-4">
            <div className="sequence-label mb-2">
              <span className="badge bg-purple px-3 py-2 me-2">
                <i className="bi bi-braces me-1"></i>
                CDS
              </span>
              <span className="fw-semibold">CDS Sequence (Coding Region)</span>
            </div>
            <div className="sequence-container sequence-type-cds p-3 rounded border" 
                 style={{ 
                   backgroundColor: '#f3e5f5',
                   borderColor: '#9c27b0',
                   maxHeight: '200px',
                   overflowY: 'auto'
                 }}>
              <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                {transcriptData.cds_sequence}
              </code>
            </div>
          </div>
        )}
        
        {/* CDS Amino Acid Sequence */}
        {transcriptData.cds_aa_sequence && transcriptData.cds_aa_sequence.trim() !== '' && (
          <div className="sequence-section mb-4">
            <div className="sequence-label mb-2">
              <span className="badge bg-success px-3 py-2 me-2">
                <i className="bi bi-arrow-right-circle me-1"></i>
                AA
              </span>
              <span className="fw-semibold">Amino Acid Sequence (Translated)</span>
            </div>
            <div className="sequence-container sequence-type-amino-acid p-3 rounded border" 
                 style={{ 
                   backgroundColor: '#e8f5e8',
                   borderColor: '#28a745',
                   maxHeight: '200px',
                   overflowY: 'auto'
                 }}>
              <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                {transcriptData.cds_aa_sequence}
              </code>
            </div>
          </div>
        )}
        
        {/* Info message when no CDS sequences available */}
        {(!transcriptData.cds_sequence || transcriptData.cds_sequence.trim() === '') && (
          <div className="sequence-section">
            <div className="text-muted small p-3 bg-light rounded border">
              <i className="bi bi-info-circle me-2"></i>
              No CDS sequence available for this transcript
            </div>
          </div>
        )}
      </div>
    );
  };

  // Component to render datasets section
  const renderDatasets = (transcript: any, transcriptData: any, idPrefix: string) => {
    const datasets = transcriptData?.datasets || transcript?.datasets || [];
    
    if (datasets.length === 0) {
      return null;
    }
    
    return (
      <>
        {datasets.map((dataset: any, index: number) => (
          <div key={index} id={`${idPrefix}-dataset-${index}`} className="mb-4">
            {dataset.data_type === 'pdb' && dataset.data_entries.length > 0 ? (
              dataset.data_entries.map((entry: any, entryIndex: number) => (
                <PDBEntry 
                  key={entryIndex} 
                  entry={entry} 
                  entryIndex={entryIndex} 
                  dataset={dataset} 
                  dispatch={dispatch}
                />
              ))
            ) : dataset.data_type === 'boxplot' && dataset.data_entries.length > 0 ? (
              /* Expression Boxplot for boxplot data type */
              <div className="expression-dataset">
                {dataset.data_entries.map((entry: any, entryIndex: number) => (
                  <div key={entryIndex} className="mb-3">
                    <ExpressionBoxplot
                      data={entry.data}
                      width={isDualTranscriptMode ? 900 : 900}
                      height={400}
                      sortBy={boxplotSortBy}
                      sortOrder={boxplotSortOrder}
                      sortByTranscript={boxplotSortByTranscript}
                      onSortByChange={setBoxplotSortBy}
                      onSortOrderChange={setBoxplotSortOrder}
                      onSortByTranscriptChange={setBoxplotSortByTranscript}
                      primaryColor={TRANSCRIPT_COLORS.primary.main}
                      secondaryColor={TRANSCRIPT_COLORS.secondary.main}
                    />
                  </div>
                ))}
              </div>
            ) : dataset.data_entries.length > 0 ? (
              /* Regular data table for non-PDB types */
              <div className="table-responsive">
                <table className="table table-sm table-hover border rounded">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3 py-2">Entry ID</th>
                      <th className="px-3 py-2">Data Value</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.data_entries.map((entry: any, entryIndex: number) => (
                      <tr key={entryIndex}>
                        <td className="px-3 py-2">
                          <code className="small p-2 bg-light rounded">{entry.td_id || `Entry ${entryIndex + 1}`}</code>
                        </td>
                        <td className="px-3 py-2">
                          <span className="data-value fw-medium">{entry.data}</span>
                        </td>
                        <td className="px-3 py-2">
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
              <div className="text-center text-muted py-4 bg-light rounded border">
                <i className="bi bi-inbox display-6 text-muted"></i>
                <p className="mt-2 mb-0">No data entries available</p>
              </div>
            )}
          </div>
        ))}
      </>
    );
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
                        {isDualTranscriptMode ? 'Transcript Comparison' : 'Transcript Details'}
                      </a>
                    </div>
                    
                    {/* Dataset Quicklinks */}
                    {((fullTranscriptData?.datasets && Array.isArray(fullTranscriptData.datasets) && fullTranscriptData.datasets.length > 0) || 
                      (selectedTranscript?.datasets && Array.isArray(selectedTranscript.datasets) && selectedTranscript.datasets.length > 0)) && (
                      <>
                        <div className="quicklink-item mb-2">
                          <h6 className="text-muted mb-2 small">Available Datasets:</h6>
                        </div>
                        {(fullTranscriptData?.datasets || selectedTranscript?.datasets || []).map((dataset: any, index: number) => (
                          <div key={index} className="quicklink-item mb-2">
                            <a href={`#primary-dataset-${index}`} className="quicklink-link dataset-link">
                              <i className='bi-database me-2'></i>
                              <span className="small">
                                {dataset?.dataset_name || `Dataset ${index + 1}`}
                              </span>
                            </a>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* Transcript Loading Indicator */}
                    {(transcriptLoading || secondaryTranscriptLoading) && (
                      <div className="quicklink-item mb-2">
                        <div className="text-muted small">
                          <i className="bi bi-hourglass-split me-2"></i>
                          Loading transcript data...
                        </div>
                      </div>
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
                
                {/* Back to Top Button */}
                <div className="quicklink-item mb-3">
                  <button 
                    className="btn btn-outline-secondary btn-sm w-100 back-to-top-btn"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <i className="bi bi-arrow-up me-2"></i>
                    Back to Top
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
              <Card className="mb-4">
                <Card.Header>
                  <h4 className="mb-0">
                    Transcript models
                  </h4>
                  <p className="text-muted mb-0 small">
                    Click on transcripts to view detailed information. {transcriptCount} transcript{transcriptCount !== 1 ? 's' : ''} available.
                  </p>
                  <p className="text-muted mb-0 small mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    <strong>Left click</strong> to select primary transcript, <strong>right click</strong> to select secondary transcript for comparison.
                  </p>
                </Card.Header>
                <Card.Body className="p-0">
                  <TranscriptVisualization
                    key={`transcript-viz-${geneData.gene_id}`}
                    transcripts={geneData.transcripts}
                    geneCoordinates={geneCoordinates}
                    onTranscriptClick={handleTranscriptClick}
                    selectedTranscript={selectedTranscript}
                    isTranscriptLoading={transcriptLoading}
                    onSecondaryTranscriptClick={handleSecondaryTranscriptClick}
                    selectedSecondaryTranscript={selectedSecondaryTranscript}
                    isSecondaryTranscriptLoading={secondaryTranscriptLoading}
                    primaryColor={TRANSCRIPT_COLORS.primary.main}
                    secondaryColor={TRANSCRIPT_COLORS.secondary.main}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Selected Transcript Information */}
          {selectedTranscript && (
            <Row id="transcript-details">
              <Col>
                <Card className="mb-4">
                  <Card.Header>
                    <h4 className="mb-0">
                      {isDualTranscriptMode ? 'Transcript Comparison' : `Selected Transcript: ${selectedTranscript.transcript_id}`}
                    </h4>
                    {isDualTranscriptMode && (
                      <p className="text-muted mb-0 small mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        Comparing two transcripts side by side
                      </p>
                    )}
                  </Card.Header>
                  <Card.Body>
                    {isDualTranscriptMode ? (
                      /* Dual transcript comparison layout */
                      <>
                        {/* Headers Row */}
                        <Row className="mb-4">
                          <Col 
                            md={6} 
                            className="pe-md-3"
                            style={{
                              borderRight: `3px solid ${TRANSCRIPT_COLORS.primary.main}`,
                              backgroundColor: TRANSCRIPT_COLORS.primary.lighter,
                              borderRadius: '12px 0 0 12px',
                              padding: '1.5rem',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            {renderTranscriptHeader(selectedTranscript, true)}
                          </Col>
                          <Col 
                            md={6} 
                            className="ps-md-3"
                            style={{
                              borderLeft: `3px solid ${TRANSCRIPT_COLORS.secondary.main}`,
                              backgroundColor: TRANSCRIPT_COLORS.secondary.lighter,
                              borderRadius: '0 12px 12px 0',
                              padding: '1.5rem',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            {renderTranscriptHeader(selectedSecondaryTranscript, false)}
                          </Col>
                        </Row>

                        {/* Status Row */}
                        <Row className="mb-4">
                          <Col 
                            md={6} 
                            className="pe-md-3"
                            style={{
                              borderRight: `2px solid ${TRANSCRIPT_COLORS.primary.light}`,
                              paddingRight: '1.5rem'
                            }}
                          >
                            {renderTranscriptStatus(transcriptLoading, transcriptError)}
                          </Col>
                          <Col 
                            md={6} 
                            className="ps-md-3"
                            style={{
                              borderLeft: `2px solid ${TRANSCRIPT_COLORS.secondary.light}`,
                              paddingLeft: '1.5rem'
                            }}
                          >
                            {renderTranscriptStatus(secondaryTranscriptLoading, secondaryTranscriptError)}
                          </Col>
                        </Row>

                        {/* Attributes Section */}
                        {(fullTranscriptData || secondaryTranscriptData) && (
                          <>
                            <Row className="mb-3">
                              <Col>
                                <h6 className="mb-3 fw-bold text-muted">
                                  <i className="bi bi-tags me-2"></i>
                                  Attributes
                                </h6>
                              </Col>
                            </Row>
                            <Row className="mb-4">
                              <Col 
                                md={6} 
                                className="pe-md-3"
                                style={{
                                  borderRight: `2px solid ${TRANSCRIPT_COLORS.primary.light}`,
                                  paddingRight: '1.5rem'
                                }}
                              >
                                {fullTranscriptData && !transcriptLoading && !transcriptError && renderAttributes(fullTranscriptData)}
                              </Col>
                              <Col 
                                md={6} 
                                className="ps-md-3"
                                style={{
                                  borderLeft: `2px solid ${TRANSCRIPT_COLORS.secondary.light}`,
                                  paddingLeft: '1.5rem'
                                }}
                              >
                                {secondaryTranscriptData && !secondaryTranscriptLoading && !secondaryTranscriptError && renderAttributes(secondaryTranscriptData)}
                              </Col>
                            </Row>
                          </>
                        )}

                        {/* Sequences Section */}
                        {(fullTranscriptData || secondaryTranscriptData) && (
                          <>
                            <Row className="mb-3">
                              <Col>
                                <h6 className="mb-3 fw-bold text-muted">
                                  <i className="bi bi-code-slash me-2"></i>
                                  Sequences
                                </h6>
                              </Col>
                            </Row>
                            
                            {/* Nucleotide Sequence */}
                            <Row className="mb-3">
                              <Col>
                                <div className="sequence-label mb-2">
                                  <span className="badge bg-primary px-3 py-2 me-2">
                                    <i className="bi bi-dna me-1"></i>
                                    DNA
                                  </span>
                                  <span className="fw-semibold">Nucleotide Sequence (Full Transcript)</span>
                                </div>
                              </Col>
                            </Row>
                            <Row className="mb-4">
                              <Col 
                                md={6} 
                                className="pe-md-3"
                                style={{
                                  borderRight: `2px solid ${TRANSCRIPT_COLORS.primary.light}`,
                                  paddingRight: '1.5rem'
                                }}
                              >
                                {fullTranscriptData && !transcriptLoading && !transcriptError && (
                                  <div className="sequence-container sequence-type-nucleotide p-3 rounded border" 
                                       style={{ 
                                         backgroundColor: '#f8f9fa',
                                         borderColor: '#dee2e6',
                                         maxHeight: '200px',
                                         overflowY: 'auto'
                                       }}>
                                    <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                                      {fullTranscriptData.nt_sequence}
                                    </code>
                                  </div>
                                )}
                              </Col>
                              <Col 
                                md={6} 
                                className="ps-md-3"
                                style={{
                                  borderLeft: `2px solid ${TRANSCRIPT_COLORS.secondary.light}`,
                                  paddingLeft: '1.5rem'
                                }}
                              >
                                {secondaryTranscriptData && !secondaryTranscriptLoading && !secondaryTranscriptError && (
                                  <div className="sequence-container sequence-type-nucleotide p-3 rounded border" 
                                       style={{ 
                                         backgroundColor: '#f8f9fa',
                                         borderColor: '#dee2e6',
                                         maxHeight: '200px',
                                         overflowY: 'auto'
                                       }}>
                                    <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                                      {secondaryTranscriptData.nt_sequence}
                                    </code>
                                  </div>
                                )}
                              </Col>
                            </Row>
                            
                            {/* CDS Sequence - only show if either transcript has CDS data */}
                            {((fullTranscriptData?.cds_sequence && fullTranscriptData.cds_sequence.trim() !== '') || 
                               (secondaryTranscriptData?.cds_sequence && secondaryTranscriptData.cds_sequence.trim() !== '')) && (
                              <>
                                <Row className="mb-3">
                                  <Col>
                                    <div className="sequence-label mb-2">
                                      <span className="badge bg-purple px-3 py-2 me-2">
                                        <i className="bi bi-braces me-1"></i>
                                        CDS
                                      </span>
                                      <span className="fw-semibold">CDS Sequence (Coding Region)</span>
                                    </div>
                                  </Col>
                                </Row>
                                <Row className="mb-4">
                                  <Col 
                                    md={6} 
                                    className="pe-md-3"
                                    style={{
                                      borderRight: `2px solid ${TRANSCRIPT_COLORS.primary.light}`,
                                      paddingRight: '1.5rem'
                                    }}
                                  >
                                    {fullTranscriptData?.cds_sequence && fullTranscriptData.cds_sequence.trim() !== '' && (
                                      <div className="sequence-container sequence-type-cds p-3 rounded border" 
                                           style={{ 
                                             backgroundColor: '#f3e5f5',
                                             borderColor: '#9c27b0',
                                             maxHeight: '200px',
                                             overflowY: 'auto'
                                           }}>
                                        <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                                          {fullTranscriptData.cds_sequence}
                                        </code>
                                      </div>
                                    )}
                                  </Col>
                                  <Col 
                                    md={6} 
                                    className="ps-md-3"
                                    style={{
                                      borderLeft: `2px solid ${TRANSCRIPT_COLORS.secondary.light}`,
                                      paddingLeft: '1.5rem'
                                    }}
                                  >
                                    {secondaryTranscriptData?.cds_sequence && secondaryTranscriptData.cds_sequence.trim() !== '' && (
                                      <div className="sequence-container sequence-type-cds p-3 rounded border" 
                                           style={{ 
                                             backgroundColor: '#f3e5f5',
                                             borderColor: '#9c27b0',
                                             maxHeight: '200px',
                                             overflowY: 'auto'
                                           }}>
                                        <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                                          {secondaryTranscriptData.cds_sequence}
                                        </code>
                                      </div>
                                    )}
                                  </Col>
                                </Row>
                              </>
                            )}
                            
                            {/* CDS Amino Acid Sequence - only show if either transcript has AA data */}
                            {((fullTranscriptData?.cds_aa_sequence && fullTranscriptData.cds_aa_sequence.trim() !== '') || 
                               (secondaryTranscriptData?.cds_aa_sequence && secondaryTranscriptData.cds_aa_sequence.trim() !== '')) && (
                              <>
                                <Row className="mb-3">
                                  <Col>
                                    <div className="sequence-label mb-2">
                                      <span className="badge bg-success px-3 py-2 me-2">
                                        <i className="bi bi-arrow-right-circle me-1"></i>
                                        AA
                                      </span>
                                      <span className="fw-semibold">Amino Acid Sequence (Translated)</span>
                                    </div>
                                  </Col>
                                </Row>
                                <Row className="mb-4">
                                  <Col 
                                    md={6} 
                                    className="pe-md-3"
                                    style={{
                                      borderRight: `2px solid ${TRANSCRIPT_COLORS.primary.light}`,
                                      paddingRight: '1.5rem'
                                    }}
                                  >
                                    {fullTranscriptData?.cds_aa_sequence && fullTranscriptData.cds_aa_sequence.trim() !== '' && (
                                      <div className="sequence-container sequence-type-amino-acid p-3 rounded border" 
                                           style={{ 
                                             backgroundColor: '#e8f5e8',
                                             borderColor: '#28a745',
                                             maxHeight: '200px',
                                             overflowY: 'auto'
                                           }}>
                                        <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                                          {fullTranscriptData.cds_aa_sequence}
                                        </code>
                                      </div>
                                    )}
                                  </Col>
                                  <Col 
                                    md={6} 
                                    className="ps-md-3"
                                    style={{
                                      borderLeft: `2px solid ${TRANSCRIPT_COLORS.secondary.light}`,
                                      paddingLeft: '1.5rem'
                                    }}
                                  >
                                    {secondaryTranscriptData?.cds_aa_sequence && secondaryTranscriptData.cds_aa_sequence.trim() !== '' && (
                                      <div className="sequence-container sequence-type-amino-acid p-3 rounded border" 
                                           style={{ 
                                             backgroundColor: '#e8f5e8',
                                             borderColor: '#28a745',
                                             maxHeight: '200px',
                                             overflowY: 'auto'
                                           }}>
                                        <code className="sequence-text" style={{ fontSize: '0.75rem', lineHeight: '1.4', fontFamily: 'monospace' }}>
                                          {secondaryTranscriptData.cds_aa_sequence}
                                        </code>
                                      </div>
                                    )}
                                  </Col>
                                </Row>
                              </>
                            )}
                            
                            {/* Info message when no CDS sequences available for either transcript */}
                            {((!fullTranscriptData?.cds_sequence || fullTranscriptData.cds_sequence.trim() === '') && 
                               (!secondaryTranscriptData?.cds_sequence || secondaryTranscriptData.cds_sequence.trim() === '')) && (
                              <Row>
                                <Col>
                                  <div className="text-muted small p-3 bg-light rounded border text-center">
                                    <i className="bi bi-info-circle me-2"></i>
                                    No CDS sequence available for either transcript
                                  </div>
                                </Col>
                              </Row>
                            )}
                          </>
                        )}

                        {/* Datasets Section - Special handling for boxplot */}
                        {((fullTranscriptData?.datasets && fullTranscriptData.datasets.length > 0) || 
                          (secondaryTranscriptData?.datasets && secondaryTranscriptData.datasets.length > 0)) && (
                          <>
                            <Row className="mb-3">
                              <Col>
                                <h6 className="mb-3 fw-bold text-muted">
                                  <i className="bi bi-database me-2"></i>
                                  Available Datasets
                                </h6>
                              </Col>
                            </Row>
                            
                            {/* Render datasets with special boxplot handling */}
                            {(fullTranscriptData?.datasets || []).map((primaryDataset: any, index: number) => {
                              // Find corresponding secondary dataset
                              const secondaryDataset = secondaryTranscriptData?.datasets?.find((d: any) => 
                                d.dataset_name === primaryDataset.dataset_name
                              );
                              
                              return (
                                <div key={index} className="mb-4">
                                  {/* Dataset Header - spans both columns */}
                                  <Row className="mb-3">
                                    <Col>
                                      <div className="dataset-header p-3 rounded" 
                                           style={{
                                             backgroundColor: '#f8f9fa',
                                             border: '1px solid #dee2e6',
                                             borderLeft: `4px solid ${TRANSCRIPT_COLORS.primary.main}`
                                           }}>
                                        <h6 className="mb-2 fw-bold" style={{ color: TRANSCRIPT_COLORS.primary.main }}>
                                          {primaryDataset.dataset_name}
                                        </h6>
                                        <p className="text-muted mb-0 small">{primaryDataset.dataset_description}</p>
                                      </div>
                                    </Col>
                                  </Row>
                                  
                                  {/* Special handling for boxplot datasets */}
                                  {primaryDataset.data_type === 'boxplot' ? (
                                    <Row>
                                      <Col>
                                        {primaryDataset.data_entries.map((primaryEntry: any, entryIndex: number) => {
                                          const secondaryEntry = secondaryDataset?.data_entries?.[entryIndex];
                                          const comparisonData = mergeBoxplotDatasets(primaryDataset, secondaryDataset);
                                          
                                          return (
                                            <div key={entryIndex} className="mb-3">
                                              <ExpressionBoxplot
                                                data={primaryEntry.data}
                                                secondaryData={secondaryEntry?.data}
                                                width={900}
                                                height={400}
                                                sortBy={boxplotSortBy}
                                                sortOrder={boxplotSortOrder}
                                                sortByTranscript={boxplotSortByTranscript}
                                                onSortByChange={setBoxplotSortBy}
                                                onSortOrderChange={setBoxplotSortOrder}
                                                onSortByTranscriptChange={setBoxplotSortByTranscript}
                                                primaryColor={TRANSCRIPT_COLORS.primary.main}
                                                secondaryColor={TRANSCRIPT_COLORS.secondary.main}
                                                primaryLabel={selectedTranscript?.transcript_id || 'Primary'}
                                                secondaryLabel={selectedSecondaryTranscript?.transcript_id || 'Secondary'}
                                                comparisonMode={true}
                                              />
                                            </div>
                                          );
                                        })}
                                      </Col>
                                    </Row>
                                  ) : (
                                    /* Regular dataset rendering for non-boxplot types */
                                    <Row>
                                      <Col 
                                        md={6} 
                                        className="pe-md-3"
                                        style={{
                                          borderRight: `2px solid ${TRANSCRIPT_COLORS.primary.light}`,
                                          paddingRight: '1.5rem'
                                        }}
                                      >
                                        {fullTranscriptData && !transcriptLoading && !transcriptError && (
                                          <div id={`primary-dataset-${index}`}>
                                            {renderDatasets(selectedTranscript, { datasets: [primaryDataset] }, 'primary')}
                                          </div>
                                        )}
                                      </Col>
                                      <Col 
                                        md={6} 
                                        className="ps-md-3"
                                        style={{
                                          borderLeft: `2px solid ${TRANSCRIPT_COLORS.secondary.light}`,
                                          paddingLeft: '1.5rem'
                                        }}
                                      >
                                        {secondaryTranscriptData && !secondaryTranscriptLoading && !secondaryTranscriptError && (
                                          <div id={`secondary-dataset-${index}`}>
                                            {secondaryDataset ? (
                                              renderDatasets(selectedSecondaryTranscript, { datasets: [secondaryDataset] }, 'secondary')
                                            ) : (
                                              <div className="text-center text-muted py-4 bg-light rounded border">
                                                <i className="bi bi-exclamation-triangle me-2"></i>
                                                <p className="mt-2 mb-0">No corresponding dataset found</p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </Col>
                                    </Row>
                                  )}
                                </div>
                              );
                            })}
                          </>
                        )}
                      </>
                    ) : (
                      /* Single transcript layout (original) */
                      <>
                        <Row className="align-items-center mb-4 p-3 rounded" 
                             style={{
                               backgroundColor: TRANSCRIPT_COLORS.primary.lighter,
                               border: `2px solid ${TRANSCRIPT_COLORS.primary.main}`,
                               borderRadius: '12px'
                             }}>
                          <Col lg={5} md={12} className="d-flex align-items-center mb-2 mb-lg-0">
                            <h5 className="mb-0 fw-bold" style={{ color: TRANSCRIPT_COLORS.primary.main }}>
                              <span className="badge me-3 px-3 py-2" 
                                    style={{ 
                                      backgroundColor: TRANSCRIPT_COLORS.primary.main,
                                      color: 'white'
                                    }}>
                                Primary
                              </span>
                              {selectedTranscript.transcript_id}
                            </h5>
                          </Col>
                          <Col lg={2} md={6} className="text-center text-lg-center mb-2 mb-lg-0">
                            <span className="badge bg-secondary px-3 py-2">{selectedTranscript.transcript_type}</span>
                          </Col>
                          <Col lg={5} md={6} className="text-end text-lg-end">
                            <code className="bg-white p-3 rounded border fw-medium" style={{ fontSize: '0.9rem' }}>
                              {getSequenceName(selectedTranscript.sequence_id.toString())}:{selectedTranscript.coordinates.start.toLocaleString()}-{selectedTranscript.coordinates.end.toLocaleString()}
                            </code>
                          </Col>
                        </Row>

                        {renderTranscriptStatus(transcriptLoading, transcriptError)}

                        {/* Attributes */}
                        {fullTranscriptData && !transcriptLoading && !transcriptError && (
                          <div className="mb-4">
                            <h6 className="mb-3 fw-bold text-muted">
                              <i className="bi bi-tags me-2"></i>
                              Attributes
                            </h6>
                            {renderAttributes(fullTranscriptData)}
                          </div>
                        )}

                        {/* Sequences */}
                        {fullTranscriptData && !transcriptLoading && !transcriptError && (
                          <div className="mb-4">
                            <h6 className="mb-3 fw-bold text-muted">
                              <i className="bi bi-code-slash me-2"></i>
                              Sequences
                            </h6>
                            {renderSequences(fullTranscriptData)}
                          </div>
                        )}

                        {/* Individual Dataset Sections */}
                        {fullTranscriptData?.datasets && fullTranscriptData.datasets.length > 0 && (
                          <div className="mt-4">
                            <h6 className="mb-3 fw-bold text-muted">
                              <i className="bi bi-database me-2"></i>
                              Available Datasets
                            </h6>
                            {renderDatasets(selectedTranscript, fullTranscriptData, 'primary')}
                          </div>
                        )}
                      </>
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