import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import { RootState, AppDispatch } from '../redux/store';
import { Configuration } from '../types';
import { clearGlobalData } from '../redux/globalData/globalDataSlice';
import { ConfigurationFormModal } from '../components/configurationManager';
import { 
  createConfiguration, 
  updateConfiguration, 
  deleteConfiguration, 
  activateConfiguration 
} from '../redux/adminData/adminDataThunks';

const ConfigurationsManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { configurations, organisms, assemblies, sources, loading: globalLoading, error } = useSelector((state: RootState) => state.globalData);
  const { loading: adminLoading } = useSelector((state: RootState) => state.adminData);
  
  // Convert data to arrays for easier use
  const configurationsArray: Configuration[] = configurations ? Object.values(configurations) : [];
  
  // State for managing configurations
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  
  // Form states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Configuration management handlers
  const handleAddConfiguration = async (configData: Configuration) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      await dispatch(createConfiguration(configData)).unwrap();
      setShowAddConfigModal(false);
      setFormSuccess('Configuration added successfully!');
      dispatch(clearGlobalData());
    } catch (error: any) {
      setFormError(error.message || 'Failed to add configuration');
    }
  };

  const handleUpdateConfiguration = async (configData: Configuration) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      await dispatch(updateConfiguration(configData)).unwrap();
      setEditingConfig(null);
      setFormSuccess('Configuration updated successfully!');
      dispatch(clearGlobalData());
    } catch (error: any) {
      setFormError(error.message || 'Failed to update configuration');
    }
  };

  const handleDeleteConfiguration = async (configurationId: number) => {
    if (!window.confirm('Are you sure you want to delete this configuration? This action cannot be undone.')) {
      return;
    }

    try {
      setFormError(null);
      setFormSuccess(null);
      
      await dispatch(deleteConfiguration(configurationId)).unwrap();
      setFormSuccess('Configuration deleted successfully!');
      dispatch(clearGlobalData());
    } catch (error: any) {
      setFormError(error.message || 'Failed to delete configuration');
    }
  };

  const handleActivateConfiguration = async (configurationId: number) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      await dispatch(activateConfiguration(configurationId)).unwrap();
      setFormSuccess('Configuration activated successfully!');
      dispatch(clearGlobalData());
    } catch (error: any) {
      setFormError(error.message || 'Failed to activate configuration');
    }
  };

  if (globalLoading) {
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

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-cogs me-2"></i>
                Configuration Management
              </h5>
              <Button
                variant="primary"
                onClick={() => setShowAddConfigModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add Configuration
              </Button>
            </Card.Header>
            <Card.Body>
              {formError && (
                <Alert variant="danger" dismissible onClose={() => setFormError(null)}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {formError}
                </Alert>
              )}
              
              {formSuccess && (
                <Alert variant="success" dismissible onClose={() => setFormSuccess(null)}>
                  <i className="fas fa-check-circle me-2"></i>
                  {formSuccess}
                </Alert>
              )}

              {configurationsArray.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-cogs fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No configurations found.</p>
                  <p className="text-muted small">
                    Create a configuration to set up default settings for the application.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Organism</th>
                        <th>Assembly</th>
                        <th>Nomenclature</th>
                        <th>Source</th>
                        <th>Version</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configurationsArray.map((config) => (
                        <tr key={config.configuration_id}>
                          <td>
                            {config.active ? (
                              <Badge bg="success">
                                <i className="fas fa-check me-1"></i>
                                Active
                              </Badge>
                            ) : (
                              <Badge bg="secondary">
                                <i className="fas fa-times me-1"></i>
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td>
                            <strong>{config.description}</strong>
                          </td>
                          <td>
                            {organisms[config.organism_id]?.scientific_name || 'Unknown'}
                          </td>
                          <td>
                            {assemblies[config.assembly_id]?.assembly_name || 'Unknown'}
                          </td>
                          <td>
                            {config.nomenclature}
                          </td>
                          <td>
                            {sources[config.source_id]?.name || 'Unknown'}
                          </td>
                          <td>
                            {sources[config.source_id]?.versions?.[config.sv_id]?.version_name || 'Unknown'}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {!config.active && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleActivateConfiguration(config.configuration_id)}
                                  title="Activate"
                                >
                                  <i className="fas fa-check"></i>
                                </Button>
                              )}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setEditingConfig(config)}
                                title="Edit"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteConfiguration(config.configuration_id)}
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Configuration Form Modals */}
      <ConfigurationFormModal
        show={showAddConfigModal}
        onClose={() => setShowAddConfigModal(false)}
        onSubmit={handleAddConfiguration}
        configuration={null}
        isEditing={false}
        loading={adminLoading}
      />

      <ConfigurationFormModal
        show={!!editingConfig}
        onClose={() => setEditingConfig(null)}
        onSubmit={handleUpdateConfiguration}
        configuration={editingConfig}
        isEditing={true}
        loading={adminLoading}
      />
    </Container>
  );
};

export default ConfigurationsManagement; 