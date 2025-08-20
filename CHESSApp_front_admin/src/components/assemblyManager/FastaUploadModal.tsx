import React, { useState } from 'react';
import { Modal, Form, Button, ProgressBar } from 'react-bootstrap';
import { Assembly } from '../../types';

interface FastaUploadModalProps {
  assembly: Assembly;
  show: boolean;
  onSubmit: (uploadData: {
    file: File;
    file_type: string;
    assembly_id: number;
    nomenclature: string;
    onProgress?: (progress: number) => void;
  }) => Promise<void>;
  onCancel: () => void;
  onError: (error: string) => void;
  onSuccess: () => void;
}

const FastaUploadModal: React.FC<FastaUploadModalProps> = ({ 
  assembly, 
  show,
  onSubmit, 
  onCancel, 
  onError, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    nomenclature: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.fasta') && !file.name.toLowerCase().endsWith('.fa')) {
        onError('Please select a valid FASTA file (.fasta or .fa)');
        return;
      }
      
      const maxSize = 50 * 1024 * 1024 * 1024; // 50GB
      if (file.size > maxSize) {
        onError(`File size (${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB) exceeds the 50GB limit`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      onError('Please select a FASTA file');
      return;
    }

    if (!formData.nomenclature.trim()) {
      onError('Please provide a nomenclature name');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      await onSubmit({
        file: selectedFile,
        file_type: 'fasta',
        assembly_id: assembly.assembly_id,
        nomenclature: formData.nomenclature.trim(),
        onProgress: (progress: number) => {
          setUploadProgress(progress);
        }
      });
      onSuccess();
      handleClose();
    } catch (error: any) {
      onError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setFormData({ nomenclature: '' });
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    onCancel();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-upload me-2"></i>
          Upload FASTA File for {assembly.assembly_name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Nomenclature Name *
            </Form.Label>
            <Form.Control
              type="text"
              name="nomenclature"
              value={formData.nomenclature}
              onChange={handleChange}
              placeholder="Enter a unique name for this nomenclature"
              required
              disabled={uploading}
            />
            <Form.Text>
              This name will be used to identify the nomenclature in the system
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              FASTA File *
            </Form.Label>
            <Form.Control
              type="file"
              accept=".fasta,.fa"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Form.Text>
              Select a FASTA file (.fasta or .fa) up to 50GB
            </Form.Text>
            {selectedFile && (
              <div className="mt-2">
                <small className="text-muted">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </small>
              </div>
            )}
          </Form.Group>

          {uploading && (
            <div className="mb-3">
              <ProgressBar 
                now={uploadProgress} 
                label={`${uploadProgress}%`}
                variant="primary"
              />
              <small className="text-muted">
                Uploading... Please do not close this window.
              </small>
            </div>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={uploading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={uploading || !selectedFile || !formData.nomenclature.trim()}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Uploading...
            </>
          ) : (
            'Upload FASTA File'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FastaUploadModal; 