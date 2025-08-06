import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Source } from '../../types/db_types';

interface SourceFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (sourceData: Source) => void;
  source: Source | null;
  isEditing: boolean;
}

const SourceFormModal: React.FC<SourceFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  source,
  isEditing
}) => {
  const [name, setName] = useState('');
  const [information, setInformation] = useState('');
  const [link, setLink] = useState('');
  const [citation, setCitation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      if (isEditing && source) {
        setName(source.name || '');
        setInformation(source.information || '');
        setLink(source.link || '');
        setCitation(source.citation || '');
      } else {
        setName('');
        setInformation('');
        setLink('');
        setCitation('');
      }
    }
  }, [source, isEditing, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        source_id: source?.source_id || -1,
        name,
        information,
        link,
        citation
      });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setInformation('');
    setLink('');
    setCitation('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          {isEditing ? 'Edit Source' : 'Add New Source'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Source Name *</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={45}
              disabled={isSubmitting}
            />
            <Form.Text>Enter a unique name for this source (e.g., "Ensembl", "RefSeq", "GENCODE")</Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description/Information</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              placeholder="Description of this source..."
              disabled={isSubmitting}
            />
            <Form.Text>Provide a description of what this source represents</Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Link</Form.Label>
            <Form.Control
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              disabled={isSubmitting}
            />
            <Form.Text>URL to the source's website or documentation</Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Citation</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="Citation information..."
              disabled={isSubmitting}
            />
            <Form.Text>How to cite this source in publications</Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {isEditing ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            `${isEditing ? 'Update' : 'Add'} Source`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SourceFormModal; 