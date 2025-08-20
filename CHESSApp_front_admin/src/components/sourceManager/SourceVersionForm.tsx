import React, { useState, useEffect } from 'react';
import { SourceVersionFormData } from '../types/source';

interface SourceVersionFormProps {
  onSubmit: (data: SourceVersionFormData) => void;
  onCancel: () => void;
  sourceId: number;
}

const SourceVersionForm: React.FC<SourceVersionFormProps> = ({ 
  onSubmit, 
  onCancel, 
  sourceId
}) => {
  const [formData, setFormData] = useState<SourceVersionFormData>({
    source_id: sourceId,
    version_name: '',
    assembly_id: undefined,
    gtf_file: undefined
  });

  useEffect(() => {
    setFormData({
      source_id: sourceId,
      version_name: '',
      assembly_id: undefined,
      gtf_file: undefined
    });
  }, [sourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof SourceVersionFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-code-branch me-2"></i>
          Add New Source Version
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Version Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.version_name}
              onChange={handleChange('version_name')}
              required
              maxLength={45}
              placeholder="e.g., v1.0, 2023-01, etc."
            />
            <div className="form-text">
              Enter a unique version identifier for this source
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Version
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourceVersionForm; 