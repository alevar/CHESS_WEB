import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';

import './GeneTable.css';

interface GeneTableProps {
  data: {
    columns: string[];
    loci: any[][];
  };
  onRowClick?: (row: any[]) => void;
}

const GeneTable: React.FC<GeneTableProps> = ({ data, onRowClick }) => {
  const { columns, loci } = data;
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);

  const handleSort = (column: string) => {
    // Toggle sorting direction if clicking on the same column
    setSortedColumn(column === sortedColumn ? null : column);
  };

  const handleRowClick = (row: any[]) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const sortedLoci = sortedColumn
    ? [...loci].sort((a, b) => {
        const columnIndex = columns.indexOf(sortedColumn);
        return a[columnIndex] > b[columnIndex] ? 1 : -1;
      })
    : loci;

  return (
    <Table bordered hover responsive>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} onClick={() => handleSort(column)}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedLoci.map((row, rowIndex) => (
          <tr
            key={row[0]}
            style={{ backgroundColor: rowIndex % 2 === 0 ? '#e6f7ff' : 'white' }}
            onClick={() => handleRowClick(row)}
          >
            {row.map((cell, columnIndex) => (
              <td key={`${columns[columnIndex]}${row[0]}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default GeneTable;
