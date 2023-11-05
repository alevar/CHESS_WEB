import React from 'react';
import Table from 'react-bootstrap/Table';

export const GeneTranscriptTable: React.FC = () => {
  return (
    <Table striped bordered hover responsive="sm">
      <thead>
        <tr>
          <th>Genes</th>
          <th>Transcripts</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Protein Coding</td>
          <td>19838</td>
          <td>99201</td>
        </tr>
        <tr>
          <td>lncRNA</td>
          <td>17624</td>
          <td>34709</td>
        </tr>
        <tr>
          <td>Pseudogene</td>
          <td>16774</td>
          <td>17263</td>
        </tr>
        <tr>
          <td>Other</td>
          <td>4269</td>
          <td>7190</td>
        </tr>
        <tr>
          <td>Alt Scaffolds</td>
          <td>5250</td>
          <td>10088</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default GeneTranscriptTable;
