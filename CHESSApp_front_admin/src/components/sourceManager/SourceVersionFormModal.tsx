import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { SourceVersion } from '../../types';

interface SourceVersionFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (svData: SourceVersion) => void;
}

const SourceVersionFormModal: React.FC<SourceVersionFormModalProps> = ({ 
  show, 
  onClose, 
  onSubmit,
}) => {
  const [versionName, setVersionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      setVersionName('');
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        sv_id: -1,
        version_name: versionName,
        version_rank: 0,
        assemblies: {},
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setVersionName('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-code-branch me-2"></i>
          Add New Source Version
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Version Name *</Form.Label>
            <Form.Control
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              required
              maxLength={45}
              placeholder="e.g., v1.0, 2023-01, etc."
              disabled={isSubmitting}
            />
            <Form.Text>Enter a unique version identifier for this source</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting || !versionName.trim()}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Adding...
            </>
          ) : (
            'Add Version'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SourceVersionFormModal; 