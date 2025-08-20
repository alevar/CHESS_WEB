import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Organism } from '../../types';

interface OrganismsTableProps {
  organisms: { [taxonomy_id: number]: Organism };
  onEdit: (organism: Organism) => void;
  onDelete: (taxonomy_id: number) => void;
}

export const OrganismsTable: React.FC<OrganismsTableProps> = ({ 
  organisms, 
  onEdit, 
  onDelete 
}) => {
  const organismList = Object.values(organisms);

  return (
    <Table striped bordered hover className="organisms-table">
      <thead>
        <tr>
          <th>Taxonomy ID</th>
          <th>Scientific Name</th>
          <th>Common Name</th>
          <th>Information</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {organismList.length > 0 ? (
          organismList.map((organism: Organism) => (
            <tr key={organism.taxonomy_id}>
              <td>
                <Badge bg="secondary">{organism.taxonomy_id}</Badge>
              </td>
              <td>
                <strong>{organism.scientific_name}</strong>
              </td>
              <td>{organism.common_name}</td>
              <td>
                {organism.information ? (
                  <span 
                    className="organism-info" 
                    title={organism.information}
                  >
                    {organism.information}
                  </span>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td className="organism-actions">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(organism)}
                >
                  <i className="fas fa-edit me-1"></i>
                  Edit
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => onDelete(organism.taxonomy_id)}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="empty-state">
              <i className="fas fa-dna fa-2x mb-3 d-block"></i>
              <p>No organisms found. Add your first organism using the button above.</p>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}; 