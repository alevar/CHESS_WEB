import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { RootState, AppDispatch } from '../redux/store';
import { 
  addAssembly, 
  updateAssembly, 
  deleteAssembly
} from '../redux/adminData/adminDataThunks';
import AssemblyForm from '../components/assemblyManager/AssemblyForm';
import AssemblyTable from '../components/assemblyManager/AssemblyTable';
import { Assembly, Organism } from '../types';
import { clearGlobalData } from '../redux/globalData/globalDataSlice';

const AssemblyManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { sources, assemblies, organisms, loading, error } = useSelector(
    (state: RootState) => state.globalData
  );
  
  const assembliesArray: Assembly[] = assemblies ? Object.values(assemblies) : [];
  const organismsArray: Organism[] = organisms ? Object.values(organisms) : [];
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssembly, setEditingAssembly] = useState<Assembly | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleAddAssembly = async (assemblyData: Assembly) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      await dispatch(addAssembly(assemblyData)).unwrap();
      setFormSuccess('Assembly added successfully!');
      setShowAddForm(false);
      
      dispatch(clearGlobalData());
    } catch (error: any) {
      setFormError(error.message || 'Failed to add assembly');
    }
  };

  const handleUpdateAssembly = async (assemblyData: Assembly) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      await dispatch(updateAssembly({
        assembly_id: assemblyData.assembly_id,
        assemblyData: {
          assembly_id: assemblyData.assembly_id,
          assembly_name: assemblyData.assembly_name,
          taxonomy_id: assemblyData.taxonomy_id,
          information: assemblyData.information,
        }
      })).unwrap();
      setFormSuccess('Assembly updated successfully!');
      setEditingAssembly(null);
      
      dispatch(clearGlobalData());
    } catch (error: any) {
      setFormError(error.message || 'Failed to update assembly');
    }
  };

  const handleDeleteAssembly = async (assemblyId: number) => {
    if (window.confirm('Are you sure you want to delete this assembly?')) {
      try {
        setFormError(null);
        setFormSuccess(null);
        
        await dispatch(deleteAssembly(assemblyId)).unwrap();
        setFormSuccess('Assembly deleted successfully!');
        
        dispatch(clearGlobalData());
      } catch (error: any) {
        setFormError(error.message || 'Failed to delete assembly');
      }
    }
  };

  const handleAssemblyClick = (assembly: Assembly) => {
    navigate(`/assemblies/${assembly.assembly_id}`);
  };

  const getOrganismName = (taxonomyId: number) => {
    const organism = organismsArray.find(org => org.taxonomy_id === taxonomyId);
    return organism ? `${organism.scientific_name} (${organism.common_name})` : `Taxonomy ID: ${taxonomyId}`;
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setEditingAssembly(null);
    setFormError(null);
    setFormSuccess(null);
  };

  if (loading) {
    return (
      <Container fluid className="mt-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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
    <Container fluid>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Assembly Management</h2>
              <p className="text-muted mb-0">Manage assembly data in the database</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Assembly
            </Button>
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
        <Col>
          <AssemblyTable
            assemblies={assembliesArray}
            organisms={organismsArray}
            onAssemblyClick={handleAssemblyClick}
            onEditAssembly={setEditingAssembly}
            onDeleteAssembly={handleDeleteAssembly}
            getOrganismName={getOrganismName}
          />
        </Col>
      </Row>

      {/* Assembly Form Modal */}
      <AssemblyForm
        organisms={organismsArray}
        assembly={editingAssembly}
        show={showAddForm || editingAssembly !== null}
        onSubmit={(data) => {
          if (editingAssembly) {
            handleUpdateAssembly({ ...data, assembly_id: editingAssembly.assembly_id });
          } else {
            handleAddAssembly({
              assembly_id: -1, // not used for adding - here as a placeholder
              assembly_name: data.assembly_name,
              taxonomy_id: data.taxonomy_id,
              information: data.information,
            });
          }
        }}
        onCancel={handleCloseModal}
      />
    </Container>
  );
};

export default AssemblyManagement; 