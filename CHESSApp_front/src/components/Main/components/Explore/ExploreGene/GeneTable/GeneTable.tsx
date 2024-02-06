import React from 'react';
import Table from 'react-bootstrap/Table';

interface GeneTableProps {
  data: Record<string, any[]>; // Object where keys are column names and values are arrays
}

const GeneTable: React.FC<GeneTableProps> = ({ data }) => {
  const columns = Object.keys(data);

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data[columns[0]].map((_, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={column + rowIndex}>{data[column][rowIndex]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default GeneTable;
