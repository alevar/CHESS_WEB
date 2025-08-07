import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Configuration } from '../../types';
import { RootState } from '../../redux/store';

interface ConfigurationFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (configData: Configuration) => void;
  configuration: Configuration | null;
  isEditing: boolean;
  loading?: boolean;
}

interface OptionData {
  organisms: Array<{ taxonomy_id: number; scientific_name: string; common_name: string }>;
  assemblies: Array<{ assembly_id: number; assembly_name: string }>;
  nomenclatures: string[];
  sources: Array<{ source_id: number; name: string }>;
  versions: Array<{ sv_id: number; version_name: string }>;
}

const ConfigurationFormModal: React.FC<ConfigurationFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  configuration,
  isEditing,
  loading = false
}) => {
  const { organisms, assemblies, sources } = useSelector((state: RootState) => state.globalData);
  
  const [formData, setFormData] = useState({
    description: '',
    organism_id: '',
    assembly_id: '',
    nomenclature: '',
    source_id: '',
    sv_id: '',
    set_active: false
  });

  const [options, setOptions] = useState<OptionData>({
    organisms: [],
    assemblies: [],
    nomenclatures: [],
    sources: [],
    versions: [],
  });

  const [error, setError] = useState<string | null>(null);

  // Load form data when editing and populate options from globalData
  useEffect(() => {
    if (show) {
      // Populate options from globalData
      const organismsArray = organisms ? Object.values(organisms) : [];
      
      setOptions(prev => ({
        ...prev,
        organisms: organismsArray.map(org => ({
          taxonomy_id: org.taxonomy_id,
          scientific_name: org.scientific_name,
          common_name: org.common_name
        })),
        sources: [] // Sources will be loaded when assembly is selected
      }));

      if (configuration && isEditing) {
        setFormData({
          description: configuration.description,
          organism_id: configuration.organism_id.toString(),
          assembly_id: configuration.assembly_id.toString(),
          nomenclature: configuration.nomenclature,
          source_id: configuration.source_id.toString(),
          sv_id: configuration.sv_id.toString(),
          set_active: configuration.active
        });
        
        // Load dependent options for editing
        if (configuration.organism_id) {
          loadAssembliesFromGlobalData(configuration.organism_id);
        }
        if (configuration.assembly_id) {
          loadNomenclaturesFromGlobalData(configuration.assembly_id);
          loadSourcesForAssembly(configuration.assembly_id);
        }
        if (configuration.source_id) {
          loadSourceVersionsFromGlobalData(configuration.source_id);
        }
      } else if (!isEditing) {
        // Reset form for new configuration
        setFormData({
          description: '',
          organism_id: '',
          assembly_id: '',
          nomenclature: '',
          source_id: '',
          sv_id: '',
          set_active: false
        });
        setOptions(prev => ({
          ...prev,
          assemblies: [],
          nomenclatures: [],
          versions: []
        }));
      }
    }
  }, [show, configuration, isEditing, organisms, sources]);

  // Helper functions to load data from globalData
  const loadAssembliesFromGlobalData = (organismId: number) => {
    const assembliesArray = assemblies ? Object.values(assemblies) : [];
    const organismAssemblies = assembliesArray.filter(assembly => assembly.taxonomy_id === organismId);
    
    setOptions(prev => ({
      ...prev,
      assemblies: organismAssemblies.map(assembly => ({
        assembly_id: assembly.assembly_id,
        assembly_name: assembly.assembly_name
      }))
    }));
  };

  const loadNomenclaturesFromGlobalData = (assemblyId: number) => {
    const assembliesArray = assemblies ? Object.values(assemblies) : [];
    const assembly = assembliesArray.find(assembly => assembly.assembly_id === assemblyId);
    
    setOptions(prev => ({
      ...prev,
      nomenclatures: assembly?.nomenclatures || []
    }));
  };

  const loadSourceVersionsFromGlobalData = (sourceId: number) => {
    const sourcesArray = sources ? Object.values(sources) : [];
    const source = sourcesArray.find(source => source.source_id === sourceId);
    
    if (source?.versions) {
      const versionsArray = Object.values(source.versions);
      setOptions(prev => ({
        ...prev,
        versions: versionsArray.map(version => ({
          sv_id: version.sv_id,
          version_name: version.version_name
        }))
      }));
    }
  };

  const loadSourcesForAssembly = (assemblyId: number) => {
    const sourcesArray = sources ? Object.values(sources) : [];
    const validSources: Array<{ source_id: number; name: string }> = [];
    
    // Find sources that have source version assemblies on the selected assembly
    for (const source of sourcesArray) {
      if (source.versions) {
        for (const version of Object.values(source.versions)) {
          if (version.assemblies) {
            // Check if any assembly in this version matches the selected assembly
            const hasAssembly = Object.values(version.assemblies).some(
              (assembly: any) => assembly.assembly_id === assemblyId
            );
            if (hasAssembly) {
              validSources.push({
                source_id: source.source_id,
                name: source.name
              });
              break;
            }
          }
        }
      }
    }
    
    setOptions(prev => ({
      ...prev,
      sources: validSources
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Handle cascading dropdowns
    if (name === 'organism_id' && value) {
      loadAssembliesFromGlobalData(parseInt(value));
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        assembly_id: '',
        nomenclature: '',
        source_id: '',
        sv_id: ''
      }));
      setOptions(prev => ({
        ...prev,
        nomenclatures: [],
        sources: [],
        versions: []
      }));
    } else if (name === 'assembly_id' && value) {
      loadNomenclaturesFromGlobalData(parseInt(value));
      loadSourcesForAssembly(parseInt(value));
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        nomenclature: '',
        source_id: '',
        sv_id: ''
      }));
      setOptions(prev => ({
        ...prev,
        versions: []
      }));
    } else if (name === 'source_id' && value) {
      loadSourceVersionsFromGlobalData(parseInt(value));
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        sv_id: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.organism_id || !formData.assembly_id || !formData.nomenclature || 
        !formData.source_id || !formData.sv_id) {
      setError('All fields are required');
      return;
    }

    const configData: any = {
      configuration_id: configuration?.configuration_id || 0,
      set_active: formData.set_active,
      description: formData.description.trim(),
      organism_id: parseInt(formData.organism_id),
      assembly_id: parseInt(formData.assembly_id),
      nomenclature: formData.nomenclature,
      source_id: parseInt(formData.source_id),
      sv_id: parseInt(formData.sv_id)
    };

    onSubmit(configData);
  };

  const handleClose = () => {
    setFormData({
      description: '',
      organism_id: '',
      assembly_id: '',
      nomenclature: '',
      source_id: '',
      sv_id: '',
      set_active: false
    });
    setError(null);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-cog me-2"></i>
          {isEditing ? 'Edit Configuration' : 'Add New Configuration'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}



        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this configuration..."
              required
              disabled={loading}
            />
            <Form.Text>Provide a clear description of what this configuration represents</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Organism *</Form.Label>
            <Form.Select
              name="organism_id"
              value={formData.organism_id}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select an organism...</option>
              {options.organisms.map((organism) => (
                <option key={organism.taxonomy_id} value={organism.taxonomy_id}>
                  {organism.scientific_name} ({organism.common_name})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assembly *</Form.Label>
            <Form.Select
              name="assembly_id"
              value={formData.assembly_id}
              onChange={handleChange}
              required
              disabled={loading || !formData.organism_id}
            >
              <option value="">{formData.organism_id ? 'Select an assembly...' : 'Select an organism first...'}</option>
              {options.assemblies.map((assembly) => (
                <option key={assembly.assembly_id} value={assembly.assembly_id}>
                  {assembly.assembly_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nomenclature *</Form.Label>
            <Form.Select
              name="nomenclature"
              value={formData.nomenclature}
              onChange={handleChange}
              required
              disabled={loading || !formData.assembly_id}
            >
              <option value="">{formData.assembly_id ? 'Select a nomenclature...' : 'Select an assembly first...'}</option>
              {options.nomenclatures.map((nomenclature) => (
                <option key={nomenclature} value={nomenclature}>
                  {nomenclature}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Source *</Form.Label>
            <Form.Select
              name="source_id"
              value={formData.source_id}
              onChange={handleChange}
              required
              disabled={loading || !formData.assembly_id}
            >
              <option value="">{formData.assembly_id ? 'Select a source...' : 'Select an assembly first...'}</option>
              {options.sources.map((source) => (
                <option key={source.source_id} value={source.source_id}>
                  {source.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Source Version *</Form.Label>
            <Form.Select
              name="sv_id"
              value={formData.sv_id}
              onChange={handleChange}
              required
              disabled={loading || !formData.source_id}
            >
              <option value="">{formData.source_id ? 'Select a version...' : 'Select a source first...'}</option>
              {options.versions.map((version) => (
                <option key={version.sv_id} value={version.sv_id}>
                  {version.version_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="set_active"
              checked={formData.set_active}
              onChange={handleChange}
              label="Set as active configuration"
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Only one configuration can be active at a time. Setting this as active will deactivate any other active configuration.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={loading || !formData.description.trim() || 
                   !formData.organism_id || !formData.assembly_id || !formData.nomenclature || 
                   !formData.source_id || !formData.sv_id}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            `${isEditing ? 'Update' : 'Create'} Configuration`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfigurationFormModal; 