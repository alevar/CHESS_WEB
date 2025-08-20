import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { DataType } from '../../types';

interface DataTypesTableProps {
  dataTypes: DataType[];
  onEdit: (dataType: DataType) => void;
  onDelete: (dataType: string) => void;
  loading: boolean;
}

export const DataTypesTable: React.FC<DataTypesTableProps> = ({
  dataTypes,
  onEdit,
  onDelete,
  loading
}) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (dataTypes.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        <p>No data types found. Create your first data type to get started.</p>
      </div>
    );
  }

  return (
    <Table responsive striped hover>
      <thead>
        <tr>
          <th>Data Type</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {dataTypes.map((dataType) => (
          <tr key={dataType.data_type}>
            <td>
              <Badge bg="primary" className="fs-6">
                {dataType.data_type}
              </Badge>
            </td>
            <td>{dataType.description}</td>
            <td>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEdit(dataType)}
                  title="Edit data type"
                >
                  <i className="fas fa-edit"></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(dataType.data_type)}
                  title="Delete data type"
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}; 