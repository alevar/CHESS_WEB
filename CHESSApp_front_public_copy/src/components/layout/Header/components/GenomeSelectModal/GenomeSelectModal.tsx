import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Badge, Alert, Table, Modal } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDbData, useSelectedOrganism, useSelectedAssembly, useAppSelections } from '../../../../../redux/hooks';
import { parsePathname, buildPathname } from '../../../../../utils/utils';
import { Organism, Assembly, Source, SourceVersion } from '../../../../../types/dbTypes';

type SelectionStep = 'organism' | 'assembly' | 'nomenclature' | 'source' | 'version';

interface PathParts {
    params: Record<string, string>;
    remainder: string;
}

interface TempSelections {
    organism?: Organism;
    assembly?: Assembly;
    nomenclature?: string;
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

    const steps: SelectionStep[] = ['organism', 'assembly', 'nomenclature', 'source', 'version'];

    // Reset modal state
    const resetModal = () => {
        setCurrentStep('organism');
        setTempSelections({});
    };

    const handleClose = () => {
        setShow(false);
        resetModal();
    };

    const handleShow = () => setShow(true);

    useEffect(() => {
        if (show) resetModal();
    }, [show]);

    // Simplified data getters
    const getData = {
        organisms: () => Object.values(dbData.organisms || {}),
        assemblies: (organism: Organism) => 
            Object.values(dbData.assemblies || {}).filter(
                assembly => assembly.taxonomy_id === organism.taxonomy_id
            ),
        sources: (assembly: Assembly) => 
            Object.values(dbData.sources || {}).filter(source => {
                if (!source.versions) return false;
                return Object.values(source.versions).some(version => {
                    if (!version.assemblies) return false;
                    return Object.values(version.assemblies).some(sva => 
                        sva.assembly_id === assembly.assembly_id
                    );
                });
            }),
        versions: (source: Source) => {
            if (!source.versions || !tempSelections.assembly) return [];
            
            // Filter versions to only show those that have assemblies matching the selected assembly
            const compatibleVersions = Object.values(source.versions).filter(version => {
                if (!version.assemblies) return false;
                return Object.values(version.assemblies).some(sva => 
                    sva.assembly_id === tempSelections.assembly!.assembly_id
                );
            });
            
            return compatibleVersions.sort((a, b) => a.version_rank - b.version_rank);
        },
        defaultVersion: (source: Source) => {
            const versions = getData.versions(source);
            return versions[0];
        }
    };

    // Simplified selection handlers
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
        
        // Auto-advance to next step
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
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

    const handleNext = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleConfirmSelection = () => {
        const { organism, assembly, source, version, nomenclature } = tempSelections;
        if (organism && assembly && source && version) {
            const params: Record<string, string> = {
                oid: organism.taxonomy_id.toString(),
                aid: assembly.assembly_id.toString(),
                sid: source.source_id.toString(),
                vid: version.sv_id.toString(),
                ...(nomenclature && { nom: nomenclature })
            };
            
            navigate(buildPathname({ params, remainder: pathParts.remainder }));
            handleClose();
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
            className={`h-100 cursor-pointer ${isSelected ? 'border-primary' : ''}`}
            onClick={onClick}
            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <Card.Body>
                <Card.Title className="h6">{title}</Card.Title>
                {subtitle && <Card.Subtitle className="mb-2 text-muted small">{subtitle}</Card.Subtitle>}
                {description && <Card.Text className="small">{description}</Card.Text>}
                {metadata}
            </Card.Body>
        </Card>
    );

    // Simplified step content renderers
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
                        {getData.assemblies(tempSelections.organism).map(assembly => (
                            <Col md={6} key={assembly.assembly_id} className="mb-3">
                                <SelectionCard
                                    title={assembly.assembly_name}
                                    description={assembly.information}
                                    isSelected={assembly.assembly_id === tempSelections.assembly?.assembly_id}
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
                const assembly = tempSelections.assembly;
                
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
                                            className={`cursor-pointer ${isSelected ? 'table-primary' : ''}`}
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
                const sources = getData.sources(tempSelections.assembly);
                
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
                        {versions.map(version => (
                            <Col md={6} key={version.sv_id} className="mb-3">
                                <SelectionCard
                                    title={version.version_name}
                                    description={`Rank: ${version.version_rank}`}
                                    isSelected={version.sv_id === tempSelections.version?.sv_id}
                                    onClick={() => handleSelection('version', version)}
                                    metadata={
                                        <div>
                                            {version.sv_id === defaultVersion?.sv_id && (
                                                <Badge bg="success" className="small mb-2">Default</Badge>
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
                        ))}
                    </Row>
                );

            default:
                return null;
        }
    };

    // Simplified breadcrumb
    const renderBreadcrumb = () => (
        <div className="mb-3">
            <div className="d-flex flex-wrap align-items-center gap-2">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <Badge 
                            bg={currentStep === step ? 'primary' : (tempSelections[step as keyof TempSelections] ? 'success' : 'secondary')}
                            className="text-capitalize"
                        >
                            {index + 1}. {step}
                        </Badge>
                        {index < steps.length - 1 && <span className="mx-2">→</span>}
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

    // Simplified button text generation
    const getButtonText = () => {
        const currentSource = appSelections.source_id ? dbData.sources[appSelections.source_id] : null;
        const currentVersion = currentSource && appSelections.configuration_id ? 
            Object.values(currentSource.versions || {}).find(v => 
                Object.values(dbData.configurations).some(config => 
                    config.configuration_id === appSelections.configuration_id && config.sv_id === v.sv_id
                )
            ) : null;

        let text = `${currentOrganism?.common_name || 'Select Organism'} / ${currentAssembly?.assembly_name || 'Select Assembly'}`;
        
        if (appSelections.nomenclature) text += ` (${appSelections.nomenclature})`;
        if (currentSource) {
            text += ` / ${currentSource.name}`;
            if (currentVersion) text += ` [${currentVersion.version_name}]`;
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

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header>
                    <Modal.Title>{`Select ${currentStep}`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {renderBreadcrumb()}
                    {renderStepContent()}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={handleBack}
                        disabled={currentStep === 'organism'}
                    >
                        Back
                    </Button>
                    {currentStep === 'version' && (
                        <Button 
                            variant="primary" 
                            onClick={handleConfirmSelection}
                            disabled={!canProceed()}
                        >
                            Confirm Selection
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default GenomeSelectModal;