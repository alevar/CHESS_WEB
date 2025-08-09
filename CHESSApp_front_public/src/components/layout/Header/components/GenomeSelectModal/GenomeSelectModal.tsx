import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Row, Col, Badge, Alert, Table } from 'react-bootstrap';

import { PathParts, parsePathname, buildPathname } from '../../../../../utils/utils';
import { useDbData, useSelectedOrganism, useSelectedAssembly, useAppSelections } from '../../../../../hooks/useGlobalData';
import { Organism, Assembly, Source, SourceVersion } from '../../../../../types/dbTypes';

import CustomModal from '../../../../common/CustomModal/CustomModal';

type SelectionStep = 'organism' | 'assembly' | 'nomenclature' | 'source' | 'version';

interface TempSelections {
  organism?: Organism;
  assembly?: Assembly;
  nomenclature?: string | null;
  source?: Source;
  version?: SourceVersion;
}

const GenomeSelectModal: React.FC = () => {
    const dbData = useDbData();
    const currentOrganism = useSelectedOrganism();
    const currentAssembly = useSelectedAssembly();
    const appSelections = useAppSelections();
    const navigate = useNavigate();
    const location = useLocation();
    const pathParts: PathParts = parsePathname(location.pathname);

    const [show, setShow] = useState(false);
    const [currentStep, setCurrentStep] = useState<SelectionStep>('organism');
    const [tempSelections, setTempSelections] = useState<TempSelections>({});

    const handleClose = () => {
        setShow(false);
        setCurrentStep('organism');
        setTempSelections({});
    };

    const handleShow = () => setShow(true);

    // Reset to organism step when modal opens and initialize with current selections
    useEffect(() => {
        if (show) {
            setCurrentStep('organism');
            // Initialize with current selections if they exist
            const initialSelections: TempSelections = {};
            if (currentOrganism) {
                initialSelections.organism = currentOrganism;
                if (currentAssembly) {
                    initialSelections.assembly = currentAssembly;
                    // Set nomenclature from app selections or default to first
                    initialSelections.nomenclature = appSelections.nomenclature || currentAssembly.nomenclatures?.[0] || null;
                }
            }
            setTempSelections(initialSelections);
        }
    }, [show, currentOrganism, currentAssembly, appSelections.nomenclature]);

    // Get available options for each step
    const getOrganisms = (): Organism[] => {
        return Object.values(dbData.organisms || {});
    };

    const getAssembliesForOrganism = (organism: Organism): Assembly[] => {
        return Object.values(dbData.assemblies || {}).filter(
            assembly => assembly.taxonomy_id === organism.taxonomy_id
        );
    };

    const getSourcesForAssembly = (assembly: Assembly): Source[] => {
        // Filter sources that have source_version_assembly for the current assembly
        return Object.values(dbData.sources || {}).filter(source => {
            if (!source.versions) return false;
            
            // Check if any version of this source has an assembly entry for our assembly
            return Object.values(source.versions).some(version => {
                if (!version.assemblies) return false;
                return Object.values(version.assemblies).some(sva => sva.assembly_id === assembly.assembly_id);
            });
        });
    };

    const getVersionsForSource = (source: Source): SourceVersion[] => {
        if (!source.versions) return [];
        return Object.values(source.versions).sort((a, b) => a.version_rank - b.version_rank);
    };

    const getDefaultVersion = (source: Source): SourceVersion | undefined => {
        const versions = getVersionsForSource(source);
        return versions.length > 0 ? versions[0] : undefined; // Lowest rank (first in sorted array)
    };

    // Step handlers
    const handleOrganismSelect = (organism: Organism) => {
        setTempSelections({ organism });
        setCurrentStep('assembly');
    };

    const handleAssemblySelect = (assembly: Assembly) => {
        setTempSelections(prev => ({ ...prev, assembly }));
        setCurrentStep('nomenclature');
    };

    const handleNomenclatureSelect = (nomenclature: string) => {
        setTempSelections(prev => ({ ...prev, nomenclature }));
        setCurrentStep('source');
    };

    // Helper function to get first 3 sequence identifiers for a nomenclature
    const getSequenceExamples = (assembly: Assembly, nomenclature: string): string[] => {
        if (!assembly.sequence_id_mappings) return [];
        
        const examples: string[] = [];
        const sequenceMappings = assembly.sequence_id_mappings;
        
        for (const [, mapping] of Object.entries(sequenceMappings)) {
            if (mapping.nomenclatures[nomenclature] && examples.length < 3) {
                examples.push(mapping.nomenclatures[nomenclature]);
            }
        }
        
        return examples;
    };



    const handleSourceSelect = (source: Source) => {
        const defaultVersion = getDefaultVersion(source);
        setTempSelections(prev => ({ ...prev, source, version: defaultVersion }));
        
        // If there's only one version, auto-proceed to confirm
        const versions = getVersionsForSource(source);
        if (versions.length === 1) {
            // Auto-select the only version and proceed
            setTimeout(() => setCurrentStep('version'), 100);
        } else {
            setCurrentStep('version');
        }
    };

    const handleVersionSelect = (version: SourceVersion) => {
        setTempSelections(prev => ({ ...prev, version }));
    };

    const handleConfirmSelection = () => {
        if (tempSelections.organism && tempSelections.assembly && tempSelections.source && tempSelections.version) {
            const params: Record<string, string> = {
                oid: tempSelections.organism.taxonomy_id.toString(),
                aid: tempSelections.assembly.assembly_id.toString(),
                sid: tempSelections.source.source_id.toString(),
                vid: tempSelections.version.sv_id.toString()
            };
            
            // Add nomenclature if selected
            if (tempSelections.nomenclature) {
                params.nom = tempSelections.nomenclature;
            }
            
        const new_path = buildPathname({ 
                params, 
                                        remainder: pathParts.remainder 
                                    });
        navigate(new_path);
        handleClose();
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 'organism': return !!tempSelections.organism;
            case 'assembly': return !!tempSelections.assembly;
            case 'nomenclature': return !!tempSelections.nomenclature;
            case 'source': return !!tempSelections.source;
            case 'version': return !!tempSelections.version;
            default: return false;
        }
    };

    const handleBack = () => {
        switch (currentStep) {
            case 'assembly':
                setCurrentStep('organism');
                setTempSelections(prev => ({ organism: prev.organism }));
                break;
            case 'nomenclature':
                setCurrentStep('assembly');
                setTempSelections(prev => ({ organism: prev.organism, assembly: prev.assembly }));
                break;
            case 'source':
                setCurrentStep('nomenclature');
                setTempSelections(prev => ({ organism: prev.organism, assembly: prev.assembly, nomenclature: prev.nomenclature }));
                break;
            case 'version':
                setCurrentStep('source');
                setTempSelections(prev => ({ organism: prev.organism, assembly: prev.assembly, nomenclature: prev.nomenclature, source: prev.source }));
                break;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'organism': return 'Select Organism';
            case 'assembly': return 'Select Assembly';
            case 'nomenclature': return 'Select Nomenclature';
            case 'source': return 'Select Source';
            case 'version': return 'Select Version';
            default: return 'Select';
        }
    };

    const renderBreadcrumb = () => {
        const steps = ['organism', 'assembly', 'nomenclature', 'source', 'version'];

    return (
            <div className="mb-3">
                <div className="d-flex flex-wrap align-items-center gap-2">
                    {steps.map((step, index) => (
                        <React.Fragment key={step}>
                            <div className="d-flex align-items-center">
                                <Badge 
                                    bg={currentStep === step ? 'primary' : (tempSelections[step as keyof TempSelections] ? 'success' : 'secondary')}
                                    className="text-capitalize"
                                >
                                    {index + 1}. {step}
                                </Badge>
                                {index < steps.length - 1 && <span className="mx-2">→</span>}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
                {tempSelections.organism && (
                    <div className="mt-2 small text-muted">
                        <strong>{tempSelections.organism.common_name}</strong>
                        {tempSelections.assembly && ` > ${tempSelections.assembly.assembly_name}`}
                        {tempSelections.nomenclature && ` (${tempSelections.nomenclature})`}
                        {tempSelections.source && ` > ${tempSelections.source.name}`}
                        {tempSelections.version && ` > ${tempSelections.version.version_name}`}
                    </div>
                )}
            </div>
        );
    };

    const renderOrganismSelection = () => (
        <Row>
            {getOrganisms().map(organism => (
                <Col md={6} key={organism.taxonomy_id} className="mb-3">
                                <Card 
                                    className={`h-100 cursor-pointer ${
                            organism.taxonomy_id === currentOrganism?.taxonomy_id ? 'border-primary' : ''
                                    }`}
                        onClick={() => handleOrganismSelect(organism)}
                                >
                                    <Card.Body>
                            <Card.Title className="h6">{organism.common_name}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted small">
                                {organism.scientific_name}
                            </Card.Subtitle>
                                        <Card.Text className="small">{organism.information}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
        </Row>
    );

    const renderAssemblySelection = () => {
        if (!tempSelections.organism) return null;
        const assemblies = getAssembliesForOrganism(tempSelections.organism);
        
        return (
            <Row>
                {assemblies.map(assembly => {
                    const isSelected = assembly.assembly_id === tempSelections.assembly?.assembly_id;
                    
                    return (
                        <Col md={6} key={assembly.assembly_id} className="mb-3">
                            <Card 
                                className={`h-100 cursor-pointer ${isSelected ? 'border-primary' : ''}`}
                                onClick={() => handleAssemblySelect(assembly)}
                            >
                                <Card.Body>
                                    <Card.Title className="h6">{assembly.assembly_name}</Card.Title>
                                        <Card.Text className="small">{assembly.information}</Card.Text>
                                    
                                    {assembly.nomenclatures && assembly.nomenclatures.length > 0 && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Available nomenclatures: {assembly.nomenclatures.join(', ')}
                                            </small>
                                        </div>
                                    )}
                                    
                                    {!assembly.nomenclatures && (
                                        <div className="mt-2">
                                            <small className="text-muted">No nomenclatures available</small>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        );
    };

    const renderNomenclatureSelection = () => {
        if (!tempSelections.assembly) return null;
        
        const assembly = tempSelections.assembly;
        if (!assembly.nomenclatures || assembly.nomenclatures.length === 0) {
            return (
                <Alert variant="info">
                    This assembly has no nomenclatures available.
                </Alert>
            );
        }

        return (
            <div>
                <p className="mb-3">
                    Select a nomenclature system for <strong>{assembly.assembly_name}</strong>:
                </p>
                
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
                                    className={`cursor-pointer ${isSelected ? 'table-primary' : ''}`}
                                    onClick={() => handleNomenclatureSelect(nomenclature)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <strong>{nomenclature}</strong>
                                            {isSelected && (
                                                <Badge bg="primary" className="ms-2">Selected</Badge>
                                            )}
                                        </div>
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
                
                {tempSelections.nomenclature && (
                    <div className="mt-3 p-3 bg-light rounded">
                        <small className="text-muted">
                            <strong>Selected:</strong> {tempSelections.nomenclature} nomenclature system will be used for sequence naming.
                        </small>
                    </div>
                )}
            </div>
        );
    };

    const renderSourceSelection = () => {
        if (!tempSelections.assembly) return null;
        const sources = getSourcesForAssembly(tempSelections.assembly);
        
        if (sources.length === 0) {
            return <Alert variant="info">No sources available for this assembly.</Alert>;
        }
        
        return (
            <Row>
                {sources.map(source => (
                    <Col md={6} key={source.source_id} className="mb-3">
                        <Card 
                            className="h-100 cursor-pointer"
                            onClick={() => handleSourceSelect(source)}
                        >
                            <Card.Body>
                                <Card.Title className="h6">{source.name}</Card.Title>
                                <Card.Text className="small">{source.information}</Card.Text>
                                {source.citation && (
                                    <Card.Text className="small text-muted">
                                        <strong>Citation:</strong> {source.citation}
                                    </Card.Text>
                                )}
                                {source.versions && (
                                    <div className="mt-2">
                                        <Badge bg="secondary" className="small">
                                            {Object.keys(source.versions).length} version(s)
                                        </Badge>
                                    </div>
                                        )}
                                    </Card.Body>
                                </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    const renderVersionSelection = () => {
        if (!tempSelections.source) return null;
        const versions = getVersionsForSource(tempSelections.source);
        const defaultVersion = getDefaultVersion(tempSelections.source);
        
        if (versions.length === 0) {
            return <Alert variant="info">No versions available for this source.</Alert>;
        }
        
        return (
            <Row>
                {versions.map(version => (
                    <Col md={6} key={version.sv_id} className="mb-3">
                        <Card 
                            className={`h-100 cursor-pointer ${
                                version.sv_id === tempSelections.version?.sv_id ? 'border-primary' : ''
                            }`}
                            onClick={() => handleVersionSelect(version)}
                        >
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <Card.Title className="h6">{version.version_name}</Card.Title>
                                    {version.sv_id === defaultVersion?.sv_id && (
                                        <Badge bg="success" className="small">Default</Badge>
                                    )}
                            </div>
                                <Card.Text className="small">
                                    <strong>Rank:</strong> {version.version_rank}
                                </Card.Text>
                                {version.last_updated && (
                                    <Card.Text className="small text-muted">
                                        <strong>Updated:</strong> {new Date(version.last_updated).toLocaleDateString()}
                                    </Card.Text>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'organism': return renderOrganismSelection();
            case 'assembly': return renderAssemblySelection();
            case 'nomenclature': return renderNomenclatureSelection();
            case 'source': return renderSourceSelection();
            case 'version': return renderVersionSelection();
            default: return null;
        }
    };

    // Get current source and version for display
    const currentSource = appSelections.source_id ? dbData.sources[appSelections.source_id] : null;
    const currentVersion = currentSource && appSelections.configuration_id ? 
        Object.values(currentSource.versions || {}).find(v => 
            Object.values(dbData.configurations).some(config => 
                config.configuration_id === appSelections.configuration_id && config.sv_id === v.sv_id
            )
        ) : null;

    const getButtonText = () => {
        const organism = currentOrganism?.common_name || 'Select Organism';
        const assembly = currentAssembly?.assembly_name || 'Select Assembly';
        let text = `${organism} / ${assembly}`;
        
        // Add nomenclature if selected
        if (appSelections.nomenclature) {
            text += ` (${appSelections.nomenclature})`;
        }
        
        if (currentSource) {
            text += ` / ${currentSource.name}`;
            if (currentVersion) {
                text += ` [${currentVersion.version_name}]`;
            }
        }
        
        return text;
    };

    return (
        <>
            <Button variant="outline-primary" onClick={handleShow} className="text-start">
                <div className="d-flex align-items-center">
                    <span className="text-truncate">{getButtonText()}</span>
                    <small className="ms-2">▼</small>
                </div>
            </Button>

            <CustomModal show={show} onHide={handleClose} title={getStepTitle()}>
                {renderBreadcrumb()}
                {renderStepContent()}
                
                                <div className="d-flex justify-content-between mt-4">
                    <Button 
                        variant="secondary" 
                        onClick={handleBack}
                        disabled={currentStep === 'organism'}
                    >
                        Back
                    </Button>
                    
                    {currentStep === 'version' ? (
                        <Button 
                            variant="primary" 
                            onClick={handleConfirmSelection}
                            disabled={!canProceed()}
                        >
                            Confirm Selection
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            onClick={() => {
                                if (currentStep === 'organism' && tempSelections.organism) {
                                    setCurrentStep('assembly');
                                } else if (currentStep === 'assembly' && tempSelections.assembly) {
                                    setCurrentStep('nomenclature');
                                } else if (currentStep === 'nomenclature' && tempSelections.nomenclature) {
                                    setCurrentStep('source');
                                } else if (currentStep === 'source' && tempSelections.source) {
                                    setCurrentStep('version');
                                }
                            }}
                            disabled={!canProceed()}
                        >
                            Next
                        </Button>
                    )}
                </div>
            </CustomModal>
        </>
    );
};

export default GenomeSelectModal;