import React from 'react';
import { Card, Table, Button } from 'react-bootstrap';
import { Assembly, Organism } from '../../types';

interface AssemblyTableProps {
  assemblies: Assembly[];
  organisms: Organism[];
  onAssemblyClick: (assembly: Assembly) => void;
  onEditAssembly: (assembly: Assembly) => void;
  onDeleteAssembly: (assemblyId: number) => void;
  getOrganismName: (taxonomyId: number) => string;
}

const AssemblyTable: React.FC<AssemblyTableProps> = ({
  assemblies,
  organisms,
  onAssemblyClick,
  onEditAssembly,
  onDeleteAssembly,
  getOrganismName,
}) => {
  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">
          <i className="fas fa-database me-2"></i>
          Assemblies ({assemblies.length})
        </h5>
        <p className="text-muted">
          Click on a row in the table to upload assembly fasta file and manage available nomenclatures.
        </p>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table striped hover>
            <thead>
              <tr>
                <th>Assembly Name</th>
                <th>Organism</th>
                <th>Information</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assemblies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    No assemblies found.
                  </td>
                </tr>
              ) : (
                assemblies.map((assembly) => (
                  <tr 
                    key={assembly.assembly_id} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onAssemblyClick(assembly)}
                  >
                    <td>
                      <strong>{assembly.assembly_name}</strong>
                    </td>
                    <td>{getOrganismName(assembly.taxonomy_id)}</td>
                    <td>{assembly.information}</td>
                    <td>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAssembly(assembly);
                        }}
                        title="Edit assembly"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAssembly(assembly.assembly_id);
                        }}
                        title="Delete assembly"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AssemblyTable; 