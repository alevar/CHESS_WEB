import React, { useState } from 'react';
import { Table, Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { useFindLociQuery } from '../../redux/GenomeBrowser/lociApi';

interface GeneResult {
  locus_id: string;
  seq_id: string;
  strand: string | number;
  start: number;
  end: number;
  [key: string]: any;
}

interface GeneSearchBoxProps {
  genome: number;
  onGeneSelect: (region: string) => void;
}

const GeneSearchBox: React.FC<GeneSearchBoxProps> = ({ genome, onGeneSelect }) => {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  const { data, isFetching, error } = useFindLociQuery(
    searchTerm ? { genome, term: searchTerm } : undefined,
    { skip: !searchTerm }
  );

  const results = (data && (data as any).loci) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query.trim());
  };

  const handleRowClick = (row: GeneResult) => {
    const strand = row.strand === 1 ? '+' : row.strand === -1 ? '-' : row.strand;
    const region = `${row.seq_id}${strand}:${row.start}-${row.end}`;
    onGeneSelect(region);
  };

  return (
    <div className="mb-4">
      <Form onSubmit={handleSearch} className="mb-2">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search for a gene name or ID..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Gene search"
          />
          <Button type="submit" variant="primary" disabled={isFetching || !query.trim()}>
            {isFetching ? <Spinner animation="border" size="sm" /> : 'Search'}
          </Button>
        </InputGroup>
      </Form>
      {error && <Alert variant="danger">{(error as any).message || 'Error searching genes'}</Alert>}
      {results.length > 0 && (
        <Table striped bordered hover size="sm" responsive>
          <thead>
            <tr>
              <th>Locus ID</th>
              <th>Sequence</th>
              <th>Strand</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row: GeneResult, idx: number) => (
              <tr key={row.locus_id || idx} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(row)}>
                <td>{row.locus_id}</td>
                <td>{row.seq_id}</td>
                <td>{row.strand === 1 ? '+' : row.strand === -1 ? '-' : row.strand}</td>
                <td>{row.start}</td>
                <td>{row.end}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default GeneSearchBox; 