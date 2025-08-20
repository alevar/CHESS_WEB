import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { Organism } from '../../types';

interface OrganismFormProps {
  organism?: Organism | null;
  show: boolean;
  onSubmit: (data: Omit<Organism, 'taxonomy_id'> & { taxonomy_id: number }) => void;
  onCancel: () => void;
}

export const OrganismForm: React.FC<OrganismFormProps> = ({ 
  organism, 
  show, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    taxonomy_id: 0,
    scientific_name: '',
    common_name: '',
    information: '',
  });

  // Update form data when organism prop changes
  useEffect(() => {
    setFormData({
      taxonomy_id: organism?.taxonomy_id || 0,
      scientific_name: organism?.scientific_name || '',
      common_name: organism?.common_name || '',
      information: organism?.information || '',
    });
  }, [organism]);

  // Reset form data when modal is opened for adding a new organism
  useEffect(() => {
    if (show && !organism) {
      setFormData({
        taxonomy_id: 0,
        scientific_name: '',
        common_name: '',
        information: '',
      });
    }
  }, [show, organism]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.taxonomy_id || formData.taxonomy_id <= 0) {
      alert('Please enter a valid Taxonomy ID (must be a positive integer)');
      return;
    }
    
    if (!formData.scientific_name.trim()) {
      alert('Please enter a Scientific Name');
      return;
    }
    
    if (!formData.common_name.trim()) {
      alert('Please enter a Common Name');
      return;
    }
    
    onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData({
      taxonomy_id: organism?.taxonomy_id || 0,
      scientific_name: organism?.scientific_name || '',
      common_name: organism?.common_name || '',
      information: organism?.information || '',
    });
    onCancel();
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {organism ? 'Edit Organism' : 'Add New Organism'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="organism-form">
          <Form.Group className="mb-3">
            <Form.Label htmlFor="taxonomy_id">
              Taxonomy ID <span className="required">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              id="taxonomy_id"
              value={formData.taxonomy_id || ''}
              onChange={(e) => setFormData({ ...formData, taxonomy_id: parseInt(e.target.value) || 0 })}
              min="1"
              required
              disabled={!!organism}
            />
            <Form.Text>
              {organism ? 'Taxonomy ID cannot be changed for existing organisms' : 'Enter the NCBI Taxonomy ID (e.g., 9606 for Homo sapiens)'}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="scientific_name">
              Scientific Name <span className="required">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              id="scientific_name"
              value={formData.scientific_name}
              onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
              maxLength={45}
              required
            />
            <Form.Text>Maximum 45 characters (e.g., Homo sapiens)</Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="common_name">
              Common Name <span className="required">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              id="common_name"
              value={formData.common_name}
              onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
              maxLength={45}
              required
            />
            <Form.Text>Maximum 45 characters (e.g., Human)</Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="information">Information</Form.Label>
            <Form.Control
              as="textarea"
              id="information"
              rows={3}
              value={formData.information}
              onChange={(e) => setFormData({ ...formData, information: e.target.value })}
              placeholder="Optional additional information about the organism..."
            />
            <Form.Text>Optional description or notes about the organism</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {organism ? 'Update' : 'Add'} Organism
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; 