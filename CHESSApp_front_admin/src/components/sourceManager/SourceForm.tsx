import React, { useState, useEffect } from 'react';
import { Source, SourceFormData } from '../types/source';

interface SourceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SourceFormData) => void;
  source: Source | null;
  isEditing: boolean;
}

const SourceForm: React.FC<SourceFormProps> = ({ open, onClose, onSubmit, source, isEditing }) => {
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    information: '',
    link: '',
    citation: ''
  });

  useEffect(() => {
    if (source && isEditing) {
      setFormData({
        name: source.name,
        information: source.information,
        link: source.link,
        citation: source.citation
      });
    } else {
      setFormData({
        name: '',
        information: '',
        link: '',
        citation: ''
      });
    }
  }, [source, isEditing, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof SourceFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-edit me-2"></i>
          {isEditing ? 'Edit Source' : 'Add New Source'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Source Name *
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={handleChange('name')}
              required
              maxLength={45}
            />
            <div className="form-text">
              Enter a unique name for this source (e.g., "Ensembl", "RefSeq", "GENCODE")
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">
              Description/Information
            </label>
            <textarea
              className="form-control"
              value={formData.information}
              onChange={handleChange('information')}
              rows={3}
              placeholder="Description of this source..."
            />
            <div className="form-text">
              Provide a description of what this source represents
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">
              Link
            </label>
            <input
              type="url"
              className="form-control"
              value={formData.link}
              onChange={handleChange('link')}
              placeholder="https://..."
            />
            <div className="form-text">
              URL to the source's website or documentation
            </div>
          </div>
          
          <div className="mb-3">
            <label className="form-label">
              Citation
            </label>
            <textarea
              className="form-control"
              value={formData.citation}
              onChange={handleChange('citation')}
              rows={2}
              placeholder="Citation information..."
            />
            <div className="form-text">
              How to cite this source in publications
            </div>
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Update' : 'Add'} Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourceForm; 