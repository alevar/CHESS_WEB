import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { DataType } from '../../types';

interface DataTypeFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (dataTypeData: { data_type: string; description: string }) => Promise<void>;
  dataType?: DataType | null;
  loading?: boolean;
}

export const DataTypeForm: React.FC<DataTypeFormProps> = ({
  show,
  onHide,
  onSubmit,
  dataType,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    data_type: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      if (dataType) {
        setFormData({
          data_type: dataType.data_type,
          description: dataType.description
        });
      } else {
        setFormData({
          data_type: '',
          description: ''
        });
      }
      setError(null);
    }
  }, [dataType, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.data_type.trim()) {
      setError('Data type name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save data type');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          {dataType ? 'Edit Data Type' : 'Create New Data Type'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Data Type Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.data_type}
              onChange={(e) => handleInputChange('data_type', e.target.value)}
              placeholder="Enter data type name (e.g., expression_level, annotation)"
              required
              disabled={!!dataType} // Cannot edit data type name once created
            />
            {dataType && (
              <Form.Text className="text-muted">
                Data type name cannot be changed once created.
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description for this data type"
              required
            />
            <Form.Text className="text-muted">
              Provide a clear description of what this data type represents.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              dataType ? 'Update Data Type' : 'Create Data Type'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}; 