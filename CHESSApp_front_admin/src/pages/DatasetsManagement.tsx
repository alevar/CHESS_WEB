import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../redux/store';
import { clearGlobalData } from '../redux/globalData/globalDataSlice';
import { Dataset } from '../types';
import { DatasetForm, DatasetsTable } from '../components/datasetManager';
import { createDataset, updateDataset, deleteDataset } from '../redux/adminData';
import './DatasetsManagement.css';

const DatasetsManagement: React.FC = () => {
  const { sources, assemblies, organisms, loading, error } = useSelector(
    (state: RootState) => state.globalData
  );
  const { datasets, loading: datasetsLoading, error: datasetsError } = useSelector(
    (state: RootState) => state.globalData
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);



  const handleAddDataset = async (datasetData: Partial<Dataset> & { file?: File; sva_id: number }) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      const result = await dispatch(createDataset(datasetData)).unwrap();
      setFormSuccess('Dataset created successfully');
      setShowAddForm(false);
      
      // Refresh data after adding
      dispatch(clearGlobalData());
    } catch (err: any) {
      setFormError(err.message || 'Failed to create dataset');
    }
  };

  const handleEditDataset = async (id: number, datasetData: Partial<Dataset>) => {
    try {
      setFormError(null);
      setFormSuccess(null);
      
      const result = await dispatch(updateDataset({ datasetId: id, datasetData })).unwrap();
      setFormSuccess('Dataset updated successfully');
      setEditingDataset(null);
      
      // Refresh data after editing
      dispatch(clearGlobalData());
    } catch (err: any) {
      setFormError(err.message || 'Failed to update dataset');
    }
  };

  const handleDeleteDataset = async (datasetId: number) => {
    if (!window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      return;
    }

    try {
      setFormError(null);
      setFormSuccess(null);
      
      const result = await dispatch(deleteDataset(datasetId)).unwrap();
      setFormSuccess('Dataset deleted successfully');
      
      // Refresh data after deleting
      dispatch(clearGlobalData());
    } catch (err: any) {
      setFormError(err.message || 'Failed to delete dataset');
    }
  };



  return (
    <Container fluid className="datasets-management">
      <Row>
        <Col>
          <div className="datasets-header">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="datasets-title">Datasets Management</h2>
                <p className="datasets-subtitle">Manage transcript datasets and upload data</p>
              </div>
              <Button 
                variant="primary"
                onClick={() => setShowAddForm(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Create New Dataset
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {(error || datasetsError) && (
        <Alert variant="danger">
          {error || datasetsError}
        </Alert>
      )}

      {formError && (
        <Alert variant="danger" onClose={() => setFormError(null)} dismissible>
          {formError}
        </Alert>
      )}

      {formSuccess && (
        <Alert variant="success" onClose={() => setFormSuccess(null)} dismissible>
          {formSuccess}
        </Alert>
      )}

      <Row>
        <Col xs={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-2" />
                Datasets ({Object.keys(datasets).length})
              </h5>
            </Card.Header>
            <Card.Body>
              <DatasetsTable
                datasets={Object.values(datasets)}
                onEdit={setEditingDataset}
                onDelete={handleDeleteDataset}
                loading={datasetsLoading}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <DatasetForm
        show={showAddForm}
        onHide={() => setShowAddForm(false)}
        onSubmit={handleAddDataset}
        loading={false}
      />

      <DatasetForm
        show={!!editingDataset}
        onHide={() => setEditingDataset(null)}
        onSubmit={(data) => handleEditDataset(editingDataset!.dataset_id, data)}
        dataset={editingDataset}
        loading={false}
      />
    </Container>
  );
};

export default DatasetsManagement; 