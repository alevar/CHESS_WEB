import React, { useState } from 'react';
import { Card, Button, Badge, ListGroup, Alert } from 'react-bootstrap';
import NomenclatureUploadModal from './NomenclatureUploadModal';

interface NomenclatureManagerProps {
  assemblyId: number;
  nomenclatures: { nomenclature: string }[];
  onUploadNomenclatureTsv: (uploadData: { 
    tsv_file: File; 
    source_nomenclature: string; 
    new_nomenclature: string; 
  }) => Promise<void>;
  onRemoveNomenclature: (nomenclature: string) => void;
  onSelectNomenclature: (nomenclature: string) => void;
  selectedNomenclature: string | null;
  hasFastaFiles: boolean;
}

const NomenclatureManager: React.FC<NomenclatureManagerProps> = ({
  assemblyId,
  nomenclatures,
  onUploadNomenclatureTsv,
  onRemoveNomenclature,
  onSelectNomenclature,
  selectedNomenclature,
  hasFastaFiles
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleRemoveNomenclature = (nomenclature: string) => {
    // Prevent removal if this is the only nomenclature and there are FASTA files
    if (hasFastaFiles && nomenclatures.length === 1) {
      alert('Cannot remove the last nomenclature while FASTA files exist. Please remove FASTA files first.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to remove the nomenclature '${nomenclature}'? This will also remove all associated sequence mappings.`)) {
      onRemoveNomenclature(nomenclature);
    }
  };

  const handleNomenclatureClick = (nomenclature: string) => {
    onSelectNomenclature(nomenclature);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="mb-0">Available Nomenclatures</h6>
          <small className="text-muted">
            {nomenclatures.length} nomenclature{nomenclatures.length !== 1 ? 's' : ''} available
          </small>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-1"></i>
          Add Nomenclature
        </Button>
      </div>

      {nomenclatures.length === 0 ? (
        <Alert variant="info">
          <i className="fas fa-info-circle me-2"></i>
          No nomenclatures found for this assembly.
          <br />
          <small>Upload a FASTA file to create the first nomenclature, or add a new nomenclature using the button above.</small>
        </Alert>
      ) : (
        <ListGroup>
          {nomenclatures.map(({ nomenclature }) => (
            <ListGroup.Item
              key={nomenclature}
              className={`d-flex justify-content-between align-items-center cursor-pointer ${
                selectedNomenclature === nomenclature ? 'active' : ''
              }`}
              onClick={() => handleNomenclatureClick(nomenclature)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <i className="fas fa-tag me-2"></i>
                <span className="fw-bold">{nomenclature}</span>
                {selectedNomenclature === nomenclature && (
                  <Badge bg="light" text="dark" className="ms-2">
                    Selected
                  </Badge>
                )}
              </div>
              <div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveNomenclature(nomenclature);
                  }}
                  title="Remove nomenclature"
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {selectedNomenclature && (
        <div className="mt-3">
          <Alert variant="success">
            <i className="fas fa-check-circle me-2"></i>
            <strong>Selected:</strong> {selectedNomenclature}
            <br />
            <small>This nomenclature is now active for viewing sequence mappings and FASTA files.</small>
          </Alert>
        </div>
      )}

      <NomenclatureUploadModal
        assemblyId={assemblyId}
        show={showAddModal}
        onSubmit={onUploadNomenclatureTsv}
        onCancel={() => setShowAddModal(false)}
      />
    </>
  );
};

export default NomenclatureManager; 