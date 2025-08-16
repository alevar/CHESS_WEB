import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Badge, Alert, Table, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Organism, Assembly, Source, SourceVersion } from '../../../types/dbTypes';

type SelectionStep = 'organism' | 'assembly' | 'nomenclature' | 'source' | 'version';
interface TempSelections {
  organism?: Organism;
  assembly?: Assembly;
  nomenclature?: string;
  source?: Source;
  version?: SourceVersion;
}

interface AppSettingsModalProps {
  show: boolean;
  canClose?: boolean;
  onClose?: () => void;
}

const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ show, canClose = true, onClose }) => {
  const navigate = useNavigate();
  
  const dbData = useSelector((state: RootState) => state.dbData);
  const appData = useSelector((state: RootState) => state.appData);
  
  // Get current selections from appData
  const currentOrganism = appData.selections.organism_id ? dbData.organisms[appData.selections.organism_id] : null;
  const currentAssembly = appData.selections.assembly_id ? dbData.assemblies[appData.selections.assembly_id] : null;

  const [currentStep, setCurrentStep] = useState<SelectionStep>('organism');
  const [tempSelections, setTempSelections] = useState<TempSelections>({});

  const steps: SelectionStep[] = ['organism', 'assembly', 'nomenclature', 'source', 'version'];

  // Reset modal state
  const resetModal = () => {
    setCurrentStep('organism');
    setTempSelections({});
  };

  const handleClose = () => {
    if (canClose) {
      resetModal();
      if (onClose) {
        onClose();
      }
    }
  };

  useEffect(() => {
    resetModal();
  }, []);

  // Close modal when URL changes (after successful navigation)
  useEffect(() => {
    if (show && !canClose) {
      if (onClose) {
        onClose();
      }
    }
  }, [show, canClose, onClose]);

  // Data getters
  const getData = {
    organisms: () => Object.values(dbData.organisms || {}) as Organism[],
    assemblies: (organism: Organism) => 
      Object.values(dbData.assemblies || {}).filter(
        (assembly) => (assembly as Assembly).taxonomy_id === organism.taxonomy_id
      ) as Assembly[],
    sources: (assembly: Assembly) => 
      Object.values(dbData.sources || {}).filter((source) => {
        const typedSource = source as Source;
        if (!typedSource.versions) return false;
        return Object.values(typedSource.versions).some((version) => {
          const typedVersion = version as SourceVersion;
          if (!typedVersion.assemblies) return false;
          return Object.values(typedVersion.assemblies).some((sva: any) => 
            sva.assembly_id === assembly.assembly_id
          );
        });
      }) as Source[],
    versions: (source: Source) => {
      if (!source.versions || !tempSelections.assembly) return [];
      
      const compatibleVersions = Object.values(source.versions).filter((version) => {
        const typedVersion = version as SourceVersion;
        if (!typedVersion.assemblies) return false;
        return Object.values(typedVersion.assemblies).some((sva: any) => 
          sva.assembly_id === tempSelections.assembly!.assembly_id
        );
      }) as SourceVersion[];
      
      return compatibleVersions.sort((a, b) => a.version_rank - b.version_rank);
    },
    defaultVersion: (source: Source) => {
      const versions = getData.versions(source);
      return versions[0];
    }
  };

  // Selection handlers
  const handleSelection = (step: SelectionStep, value: any) => {
    const newSelections = { ...tempSelections, [step]: value };
    
    // Auto-add default version for sources with single version
    if (step === 'source') {
      const versions = getData.versions(value);
      if (versions.length === 1) {
        newSelections.version = versions[0];
      } else {
        newSelections.version = getData.defaultVersion(value);
      }
    }
    
    setTempSelections(newSelections);
    
    // Auto-advance to next step (except for version which is the last step)
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1 && step !== 'version') {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  // Navigation
  const canProceed = () => !!tempSelections[currentStep as keyof TempSelections];
  
  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      // Clear selections from current step onwards
      const newSelections = { ...tempSelections };
      steps.slice(currentIndex).forEach(step => {
        delete newSelections[step as keyof TempSelections];
      });
      setTempSelections(newSelections);
    }
  };

  const handleConfirmSelection = () => {
    const { organism, assembly, source, version, nomenclature } = tempSelections;
    if (organism && assembly && source && version && nomenclature) {
      // Build URL with new selections using PathManager
      const newUrl = `/o:${organism.taxonomy_id}/a:${assembly.assembly_id}/s:${source.source_id}/v:${version.sv_id}/n:${nomenclature}`;
      navigate(newUrl, { replace: true });
      
      // Always close modal after successful navigation
      resetModal();
      if (onClose) {
        onClose();
      }
    }
  };

  // Reusable card component
  const SelectionCard = ({ 
    title, 
    subtitle, 
    description, 
    metadata, 
    isSelected, 
    onClick 
  }: {
    title: string;
    subtitle?: string;
    description?: string;
    metadata?: React.ReactNode;
    isSelected?: boolean;
    onClick: () => void;
  }) => (
    <Card 
      className={`h-100 border-0 shadow-sm transition-all ${isSelected ? 'border-primary border-3 shadow-lg' : 'border-light'}`}
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Card.Body className="p-3">
        <Card.Title className={`h6 mb-2 ${isSelected ? 'text-primary' : ''}`}>{title}</Card.Title>
        {subtitle && <Card.Subtitle className="mb-2 text-muted small">{subtitle}</Card.Subtitle>}
        {description && <Card.Text className="small text-muted mb-2">{description}</Card.Text>}
        {metadata && <div className="mt-auto">{metadata}</div>}
      </Card.Body>
    </Card>
  );

  // Step content renderers
  const getSequenceExamples = (assembly: Assembly, nomenclature: string): string[] => {
    if (!assembly.sequence_id_mappings) return [];
    
    const examples: string[] = [];
    for (const [, mapping] of Object.entries(assembly.sequence_id_mappings)) {
      if (mapping.nomenclatures[nomenclature] && examples.length < 3) {
        examples.push(mapping.nomenclatures[nomenclature]);
      }
    }
    return examples;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'organism':
        return (
          <Row>
            {getData.organisms().map(organism => (
              <Col md={6} key={organism.taxonomy_id} className="mb-3">
                <SelectionCard
                  title={organism.common_name}
                  subtitle={organism.scientific_name}
                  description={organism.information}
                  isSelected={organism.taxonomy_id === currentOrganism?.taxonomy_id}
                  onClick={() => handleSelection('organism', organism)}
                />
              </Col>
            ))}
          </Row>
        );

      case 'assembly':
        if (!tempSelections.organism) return null;
        return (
          <Row>
            {getData.assemblies(tempSelections.organism as Organism).map(assembly => (
              <Col md={6} key={assembly.assembly_id} className="mb-3">
                <SelectionCard
                  title={assembly.assembly_name}
                  description={assembly.information}
                  isSelected={assembly.assembly_id === currentAssembly?.assembly_id}
                  onClick={() => handleSelection('assembly', assembly)}
                  metadata={
                    <small className="text-muted">
                      {assembly.nomenclatures?.length 
                        ? `Available nomenclatures: ${assembly.nomenclatures.join(', ')}`
                        : 'No nomenclatures available'
                      }
                    </small>
                  }
                />
              </Col>
            ))}
          </Row>
        );

      case 'nomenclature':
        if (!tempSelections.assembly) return null;
        const assembly = tempSelections.assembly as Assembly;
        
        if (!assembly.nomenclatures?.length) {
          return <Alert variant="info">This assembly has no nomenclatures available.</Alert>;
        }

        return (
          <div>
            <p className="mb-3">Select a nomenclature system for <strong>{assembly.assembly_name}</strong>:</p>
            <Table striped hover>
              <thead>
                <tr>
                  <th>Nomenclature</th>
                  <th>Example Sequence Identifiers</th>
                </tr>
              </thead>
              <tbody>
                {assembly.nomenclatures.map(nomenclature => {
                  const examples = getSequenceExamples(assembly, nomenclature);
                  const isSelected = tempSelections.nomenclature === nomenclature;
                  
                  return (
                    <tr 
                      key={nomenclature}
                      className={isSelected ? 'table-primary' : ''}
                      onClick={() => handleSelection('nomenclature', nomenclature)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <strong>{nomenclature}</strong>
                        {isSelected && <Badge bg="primary" className="ms-2">Selected</Badge>}
                      </td>
                      <td>
                        {examples.length > 0 ? (
                          <div className="small">
                            {examples.join(', ')}
                            {examples.length === 3 && <span className="text-muted">...</span>}
                          </div>
                        ) : (
                          <span className="text-muted fst-italic">No sequence data available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );

      case 'source':
        if (!tempSelections.assembly) return null;
        const sources = getData.sources(tempSelections.assembly as Assembly);
        
        if (!sources.length) {
          return <Alert variant="info">No sources available for this assembly.</Alert>;
        }
        
        return (
          <Row>
            {sources.map(source => (
              <Col md={6} key={source.source_id} className="mb-3">
                <SelectionCard
                  title={source.name}
                  description={source.information}
                  onClick={() => handleSelection('source', source)}
                  metadata={
                    <div>
                      {source.citation && (
                        <div className="small text-muted mb-2">
                          <strong>Citation:</strong> {source.citation}
                        </div>
                      )}
                      <Badge bg="secondary" className="small">
                        {Object.keys(source.versions || {}).length} version(s)
                      </Badge>
                    </div>
                  }
                />
              </Col>
            ))}
          </Row>
        );

      case 'version':
        if (!tempSelections.source) return null;
        const versions = getData.versions(tempSelections.source);
        const defaultVersion = getData.defaultVersion(tempSelections.source);
        
        if (!versions.length) {
          return <Alert variant="info">No versions available for this source.</Alert>;
        }
        
        return (
          <Row>
            {versions.map(version => {
              const isSelected = version.sv_id === tempSelections.version?.sv_id;
              return (
                <Col md={6} key={version.sv_id} className="mb-3">
                  <SelectionCard
                    title={version.version_name}
                    description={`Rank: ${version.version_rank}`}
                    isSelected={isSelected}
                    onClick={() => handleSelection('version', version)}
                    metadata={
                      <div>
                        {version.sv_id === defaultVersion?.sv_id && (
                          <Badge bg="success" className="small mb-2">Default</Badge>
                        )}
                        {isSelected && (
                          <Badge bg="primary" className="small mb-2">Selected</Badge>
                        )}
                        {version.last_updated && (
                          <div className="small text-muted">
                            <strong>Updated:</strong> {new Date(version.last_updated).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Col>
              );
            })}
          </Row>
        );

      default:
        return null;
    }
  };

  // Breadcrumb
  const renderBreadcrumb = () => (
    <div className="mb-4">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <Badge 
              bg={currentStep === step ? 'primary' : (tempSelections[step as keyof TempSelections] ? 'success' : 'secondary')}
              className="text-capitalize px-3 py-2"
              style={{ fontSize: '0.875rem' }}
            >
              {index + 1}. {step}
            </Badge>
            {index < steps.length - 1 && <span className="mx-2 text-muted">→</span>}
          </React.Fragment>
        ))}
      </div>
      {tempSelections.organism && (
        <div className="p-3 bg-light rounded border">
          <div className="small text-muted mb-1">
            <strong>Current Selection:</strong>
          </div>
          <div className="text-dark">
            <strong>{(tempSelections.organism as Organism).common_name}</strong>
            {tempSelections.assembly && ` > ${(tempSelections.assembly as Assembly).assembly_name}`}
            {tempSelections.nomenclature && ` (${tempSelections.nomenclature})`}
            {tempSelections.source && ` > ${(tempSelections.source as Source).name}`}
            {tempSelections.version && ` > ${(tempSelections.version as SourceVersion).version_name}`}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
      backdrop={canClose ? true : 'static'}
      keyboard={canClose}
    >
      <Modal.Header closeButton={canClose}>
        <Modal.Title>Configure Genome Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {renderBreadcrumb()}
        {renderStepContent()}
      </Modal.Body>
      <Modal.Footer className="border-top">
        <Button 
          variant="outline-secondary" 
          onClick={handleBack}
          disabled={currentStep === 'organism'}
          size="sm"
        >
          ← Back
        </Button>
        {currentStep === 'version' && (
          <Button 
            variant="primary" 
            onClick={handleConfirmSelection}
            disabled={!canProceed()}
            size="sm"
          >
            Confirm Selection
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AppSettingsModal;