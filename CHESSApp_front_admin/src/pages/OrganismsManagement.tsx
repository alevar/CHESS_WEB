import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { RootState, AppDispatch } from '../redux/store';
import { clearGlobalData } from '../redux/globalData/globalDataSlice';
import { addOrganism, updateOrganism, deleteOrganism } from '../redux/adminData/adminDataThunks';
import { Organism } from '../types';
import { OrganismForm } from '../components/organismsManager/OrganismForm';
import { OrganismsTable } from '../components/organismsManager/OrganismsTable';
import './OrganismsManagement.css';

const OrganismsManagement: React.FC = () => {
  const { sources, assemblies, organisms, loading, error } = useSelector(
    (state: RootState) => state.globalData
  );
  const dispatch = useDispatch<AppDispatch>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrganism, setEditingOrganism] = useState<Organism | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleAddOrganism = async (organismData: Omit<Organism, 'taxonomy_id'> & { taxonomy_id: number }) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      const result = await dispatch(addOrganism(organismData)).unwrap();
      setFormSuccess(result.message || 'Organism added successfully');
      setShowAddForm(false);
      
      // Refresh data after adding
      dispatch(clearGlobalData());
    } catch (err: any) {
      setFormError(err.message || 'Failed to add organism');
    }
  };

  const handleEditOrganism = async (taxonomy_id: number, organismData: Omit<Organism, 'taxonomy_id'>) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      const result = await dispatch(updateOrganism({ taxonomy_id, organismData })).unwrap();
      setFormSuccess(result.message || 'Organism updated successfully');
      setEditingOrganism(null);
      
      // Refresh data after editing
      dispatch(clearGlobalData());
    } catch (err: any) {
      setFormError(err.message || 'Failed to update organism');
    }
  };

  const handleDeleteOrganism = async (taxonomy_id: number) => {
    if (!window.confirm('Are you sure you want to delete this organism?')) {
      return;
    }

    try {
      setFormError(null);
      setFormSuccess(null);
      
      const result = await dispatch(deleteOrganism(taxonomy_id)).unwrap();
      setFormSuccess(result.message || 'Organism deleted successfully');
      
      // Refresh data after deleting
      dispatch(clearGlobalData());
    } catch (err: any) {
      setFormError(err.message || 'Failed to delete organism');
    }
  };

  return (
    <Container fluid className="organisms-management">
      <Row>
        <Col>
          <div className="organisms-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="organisms-title">Organisms Management</h2>
                <p className="organisms-subtitle">Manage organism data in the database</p>
              </div>
              <Button 
                variant="primary"
                onClick={() => setShowAddForm(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Add New Organism
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {formError && (
        <Alert variant="danger">
          {formError}
        </Alert>
      )}

      {formSuccess && (
        <Alert variant="success">
          {formSuccess}
        </Alert>
      )}

      {loading ? (
        <div className="loading-spinner">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-dna me-2"></i>
                  Organisms ({organisms ? Object.keys(organisms).length : 0})
                </h5>
              </Card.Header>
              <Card.Body>
                <OrganismsTable
                  organisms={organisms || {}}
                  onEdit={(organism) => setEditingOrganism(organism)}
                  onDelete={handleDeleteOrganism}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <OrganismForm
        organism={editingOrganism}
        show={showAddForm || !!editingOrganism}
        onSubmit={(data) => {
          if (editingOrganism) {
            handleEditOrganism(editingOrganism.taxonomy_id, data);
          } else {
            handleAddOrganism(data);
          }
        }}
        onCancel={() => {
          setShowAddForm(false);
          setEditingOrganism(null);
          setFormError(null);
          setFormSuccess(null);
        }}
      />
    </Container>
  );
};



export default OrganismsManagement; 