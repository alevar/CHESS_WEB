import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { RootState, AppDispatch } from '../redux/store';
import { 
  uploadSourceVersionFile,
  confirmAnnotationUpload
} from '../redux/adminData/adminDataThunks';
import SourceVersionFileUploadForm from '../components/sourceManager/SourceVersionFileUploadForm';
import SourceVersionFileUploadConfirmationModal from '../components/sourceManager/SourceVersionFileUploadConfirmationModal';
import { Source, SourceVersion, SourceVersionAssembly, Assembly, Organism } from '../types/db_types';
import { NomenclatureDetectionResult, AttributeMapping } from '../types/file';
import { clearGlobalData } from '../redux/globalData/globalDataSlice';

const SourceVersionDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { sourceId, svId } = useParams<{ sourceId: string; svId: string }>();
  const { sources, assemblies, organisms, loading, error } = useSelector((state: RootState) => state.globalData);
  
  // Convert data to arrays for easier use
  const assembliesArray: Assembly[] = assemblies ? Object.values(assemblies) : [];
  const organismsArray: Organism[] = organisms ? Object.values(organisms) : [];
  
  // Get the specific source and source version
  const source: Source | undefined = sourceId ? sources?.[parseInt(sourceId)] : undefined;
  const sourceVersion: SourceVersion | undefined = svId && source?.versions ? source.versions[parseInt(svId)] : undefined;
  
  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  // File upload states
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Source version file upload confirmation states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [detectionResult, setDetectionResult] = useState<NomenclatureDetectionResult | null>(null);

  // Extract source version details from globalData
  const sourceVersionDetails = useMemo(() => {
    if (!sourceVersion) return null;
    
    const assemblies: SourceVersionAssembly[] = [];
    const files: { [file_key: string]: any } = {};
    
    console.log("sourceVersion from Redux:", sourceVersion);
    
    // Check if assemblies exist and handle different data structures
    if (sourceVersion.assemblies) {
      // Extract assemblies and files from the source version
      Object.values(sourceVersion.assemblies).forEach((assembly: any) => {
        console.log("Processing assembly:", assembly);
        
        assemblies.push({
          sva_id: assembly.sva_id,
          assembly_id: assembly.assembly_id,
          assembly_name: assembly.assembly_name,
          assembly_information: assembly.assembly_information,
          files: assembly.files || {}
        });
      
        // Extract files from this assembly
        if (assembly.files) {
          Object.entries(assembly.files).forEach(([file_key, file]: [string, any]) => {
            console.log("Processing file:", file_key, file);
            files[file_key] = {
              file_key: file_key,
              file_path: file.file_path,
              nomenclature: file.nomenclature,
              filetype: file.filetype,
              file_description: file.file_description
            };
          });
        }
      });
    } else {
      console.log("No assemblies found in sourceVersion");
    }

    return { assemblies, files };
  }, [sourceVersion]);

  // Check if files exist for this source version
  const hasFiles = useMemo(() => {
    if (!sourceVersionDetails) return false;
    return Object.keys(sourceVersionDetails.files).length > 0;
  }, [sourceVersionDetails]);

  const handleUploadFile = async (file: File, svId: number, assemblyId: number, fileType: 'gtf' | 'gff', description: string, onProgress?: (progress: number) => void) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      const uploadData = { source_id: parseInt(sourceId!), file, sv_id: svId, assembly_id: assemblyId, file_type: fileType, description, onProgress };
      const result = await dispatch(uploadSourceVersionFile(uploadData)).unwrap();
      
      // Check if this is a nomenclature detection response
      if (result && typeof result === 'object' && 'status' in result && result.status === 'nomenclature_detection') {
        const detectionData = result as any;
        setDetectionResult({
          detected_nomenclatures: detectionData.detected_nomenclatures || [],
          attributes: detectionData.attributes || {},
          file_sequences: detectionData.file_sequences || [],
          temp_file_path: detectionData.temp_file_path || '',
          norm_gtf_path: detectionData.norm_gtf_path || '',
          assembly_id: detectionData.assembly_id || 0,
          source_version_id: detectionData.source_version_id || 0,
          description: detectionData.description || ''
        });
        setShowConfirmationModal(true);
      } else {
        // Direct success (no confirmation needed)
        setShowUploadForm(false);
        setFormSuccess('File uploaded successfully!');

        dispatch(clearGlobalData());
      }
    } catch (error: any) {
      setFormError(error.message || 'Failed to upload file');
    }
  };

  const handleConfirmFileUpload = async (selectedNomenclature: string, attributeMapping: AttributeMapping) => {
    if (!detectionResult) return;
    
    try {
      setFormError(null);
      setFormSuccess(null);
      
      await dispatch(confirmAnnotationUpload({
        source_id: parseInt(sourceId!),
        sv_id: parseInt(svId!),
        confirmationData: {
          selected_nomenclature: selectedNomenclature,
          transcript_type_key: attributeMapping.transcript_type_key,
          gene_type_key: attributeMapping.gene_type_key,
          gene_name_key: attributeMapping.gene_name_key,
          attribute_types: attributeMapping.attribute_types,
          categorical_attribute_values: attributeMapping.categorical_attribute_values,
          temp_file_path: detectionResult.temp_file_path,
          norm_gtf_path: detectionResult.norm_gtf_path,
          assembly_id: detectionResult.assembly_id,
          source_version_id: detectionResult.source_version_id,
          description: detectionResult.description
        }
      })).unwrap();
      
      setShowConfirmationModal(false);
      setDetectionResult(null);
      setShowUploadForm(false);
      setFormSuccess('File uploaded successfully!');

      dispatch(clearGlobalData());
    } catch (error: any) {
      setFormError(error.message || 'Failed to confirm annotation upload');
    }
  };

  const handleCancelFileUpload = () => {
    setShowConfirmationModal(false);
    setDetectionResult(null);
    setShowUploadForm(false);
  };

  if (loading) {
    return (
      <Container fluid className="mt-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Error: {error}
        </Alert>
      </Container>
    );
  }

  if (!source || !sourceVersion) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="warning">
          Source or Source Version not found. <Button variant="link" onClick={() => navigate('/sources')}>Back to Sources</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <Button
            variant="secondary"
            onClick={() => navigate(`/sources/${sourceId}`)}
            className="mb-3"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Source
          </Button>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Source Version: {sourceVersion.version_name}</h2>
              <p className="text-muted mb-0">
                Source: {source.name} | Rank: {sourceVersion.version_rank}
              </p>
            </div>
            <div className="text-end">
              <Badge bg="info" className="fs-6 mb-2">
                Version ID: {sourceVersion.sv_id}
              </Badge>
              <div className="d-block">
                {!hasFiles ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowUploadForm(true)}
                  >
                    <i className="fas fa-upload me-2"></i>
                    Upload File
                  </Button>
                ) : (
                  <Badge bg="success">
                    <i className="fas fa-check me-1"></i>
                    View Version Details
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {formError && (
        <Alert variant="danger" dismissible onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      {formSuccess && (
        <Alert variant="success" dismissible onClose={() => setFormSuccess(null)}>
          {formSuccess}
        </Alert>
      )}

      <Row>
        {/* File Upload Section - Only show if no files exist */}
        {!hasFiles && (
          <Col xs={12} className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-upload me-2"></i>
                  GTF/GFF File Upload
                </h5>
              </Card.Header>
              <Card.Body>
                {!showUploadForm ? (
                  <div className="text-center py-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setShowUploadForm(true)}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Upload GTF/GFF File
                    </Button>
                    <p className="text-muted mt-3">
                      Upload annotation files for this source version
                    </p>
                  </div>
                ) : (
                  <SourceVersionFileUploadForm
                    sourceVersion={sourceVersion}
                    organisms={organismsArray}
                    assemblies={assembliesArray}
                    onSubmit={handleUploadFile}
                    onCancel={() => setShowUploadForm(false)}
                    onError={setFormError}
                    onSuccess={() => setFormSuccess('File uploaded successfully!')}
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Files Section */}
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-file-alt me-2"></i>
                Uploaded Files
                {sourceVersionDetails?.files && (
                  <Badge bg="info" className="ms-2">
                    {Object.keys(sourceVersionDetails.files).length} file{Object.keys(sourceVersionDetails.files).length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </h5>
            </Card.Header>
            <Card.Body>
              {!sourceVersionDetails ? (
                <div className="text-center py-4">
                  <Spinner animation="border" className="text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="text-muted">Loading files...</p>
                </div>
              ) : sourceVersionDetails?.files && Object.keys(sourceVersionDetails.files).length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Nomenclature</th>
                        <th>File Type</th>
                        <th>Description</th>
                        <th>Path</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(sourceVersionDetails.files).map((file: any, index: number) => {
                        console.log(`File ${index}:`, file);
                        return (
                        <tr key={file.file_key}>
                          <td>
                            <Badge bg="secondary">{file.nomenclature || 'Unknown'}</Badge>
                          </td>
                          <td>
                            <Badge bg="primary">{file.filetype || 'Unknown'}</Badge>
                          </td>
                          <td>{file.file_description || 'No description'}</td>
                          <td>
                            <code className="small">{file.file_path}</code>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No files uploaded for this source version.</p>
                  <p className="text-muted small">
                    Upload GTF/GFF files to get started.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Source Version File Upload Confirmation Modal */}
      {detectionResult && (
        <SourceVersionFileUploadConfirmationModal
          isOpen={showConfirmationModal}
          detectedNomenclatures={detectionResult.detected_nomenclatures}
          attributes={detectionResult.attributes}
          fileSequences={detectionResult.file_sequences}
          onConfirm={handleConfirmFileUpload}
          onCancel={handleCancelFileUpload}
          onError={setFormError}
        />
      )}
    </Container>
  );
};

export default SourceVersionDetail; 