import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { Assembly, Organism } from '../../types';

interface AssemblyFormProps {
  assembly?: Assembly | null;
  organisms: Organism[];
  show: boolean;
  onSubmit: (data: Omit<Assembly, 'assembly_id'>) => void;
  onCancel: () => void;
}

const AssemblyForm: React.FC<AssemblyFormProps> = ({ 
  assembly, 
  organisms, 
  show, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    assembly_name: '',
    taxonomy_id: 0,
    information: '',
  });

  // Update form data when assembly prop changes
  useEffect(() => {
    setFormData({
      assembly_name: assembly?.assembly_name || '',
      taxonomy_id: assembly?.taxonomy_id || 0,
      information: assembly?.information || '',
    });
  }, [assembly]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.assembly_name.trim()) {
      alert('Please enter an Assembly Name');
      return;
    }
    
    if (!formData.taxonomy_id || formData.taxonomy_id <= 0) {
      alert('Please select an Organism');
      return;
    }
    
    onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData({
      assembly_name: assembly?.assembly_name || '',
      taxonomy_id: assembly?.taxonomy_id || 0,
      information: assembly?.information || '',
    });
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'taxonomy_id' ? Number(value) : value,
    }));
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {assembly ? 'Edit Assembly' : 'Add New Assembly'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="assembly-form">
          <Form.Group className="mb-3">
            <Form.Label htmlFor="assembly_name">
              Assembly Name <span className="required">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              id="assembly_name"
              name="assembly_name"
              value={formData.assembly_name}
              onChange={handleChange}
              required
              maxLength={45}
            />
            <Form.Text>Maximum 45 characters</Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="taxonomy_id">
              Organism <span className="required">*</span>
            </Form.Label>
            <Form.Select
              id="taxonomy_id"
              name="taxonomy_id"
              value={formData.taxonomy_id}
              onChange={handleChange}
              required
            >
              <option value="">Select an organism...</option>
              {organisms.map(organism => (
                <option key={organism.taxonomy_id} value={organism.taxonomy_id}>
                  {organism.scientific_name}
                  {organism.common_name && ` (${organism.common_name})`}
                </option>
              ))}
            </Form.Select>
            <Form.Text>
              Select the organism this assembly belongs to
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="information">Information</Form.Label>
            <Form.Control
              as="textarea"
              id="information"
              name="information"
              rows={3}
              value={formData.information}
              onChange={handleChange}
              placeholder="Additional information about this assembly..."
            />
            <Form.Text>Optional description or notes about the assembly</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {assembly ? 'Update' : 'Add'} Assembly
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssemblyForm; 