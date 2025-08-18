import React from 'react';
import { Table, Badge, Pagination, Spinner, Alert, Button } from 'react-bootstrap';
import { Gene, GeneSearchPagination } from '../../../types/geneTypes';
import { useNavigate } from 'react-router-dom';
import { useDbData, useAppData } from '../../../hooks';
import { pathManager } from '../../../utils/pathManager';

interface GeneSearchResultsProps {
  genes: Gene[];
  pagination: GeneSearchPagination | null;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  onPageChange: (page: number) => void;
}

const GeneSearchResults: React.FC<GeneSearchResultsProps> = ({
  genes,
  pagination,
  loading,
  error,
  hasSearched,
  onPageChange,
}) => {
  const dbDataHook = useDbData();
  const appDataHook = useAppData();
  const appData = appDataHook.getAppData();
  const assembly = appData.selections.assembly_id 
    ? dbDataHook.getAssembly(appData.selections.assembly_id)
    : undefined;
  const nomenclature = appData.selections.nomenclature;
  const navigate = useNavigate();

  const handleViewInBrowser = (gene: Gene) => {
    if (!assembly?.assembly_id || !nomenclature) return;
    const sequenceName = dbDataHook.getSequenceNameForAssemblyNomenclature_byID(
      gene.coordinates.sequence_id,
      assembly.assembly_id,
      nomenclature
    );
    const geneLocation = `${sequenceName}:${gene.coordinates.start}-${gene.coordinates.end}`;
    const browserPath = pathManager.getBasePath() + "/browser/" + geneLocation;
    navigate(browserPath);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status" />
        <div className="mt-2">Searching genes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Search Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (hasSearched && !genes.length) {
    return (
      <Alert variant="info">
        <Alert.Heading>No Results Found</Alert.Heading>
        <p>Try adjusting your search terms or filters.</p>
      </Alert>
    );
  }

  if (!hasSearched) return null;

  const renderPagination = () => {
    if (!pagination) return null;
    const { current_page, total_pages, has_prev, has_next } = pagination;
    const pages = [];

    pages.push(
      <Pagination.Prev
        key="prev"
        disabled={!has_prev}
        onClick={() => has_prev && onPageChange(current_page - 1)}
      />
    );

    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(total_pages, current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === current_page}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    pages.push(
      <Pagination.Next
        key="next"
        disabled={!has_next}
        onClick={() => has_next && onPageChange(current_page + 1)}
      />
    );

    return <Pagination className="justify-content-center">{pages}</Pagination>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Search Results</h5>
        {pagination && (
          <small className="text-muted">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of{' '}
            {pagination.total_count} genes
          </small>
        )}
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Gene Name</th>
            <th>Gene ID</th>
            <th>Type</th>
            <th>Coordinates</th>
            <th>Transcript Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {genes.map((gene) => (
            <tr key={gene.gid}>
              <td><strong>{gene.name}</strong></td>
              <td><code>{gene.gene_id}</code></td>
              <td>
                <Badge bg="secondary">{gene.type_value}</Badge>
              </td>
              <td>
                <code>
                  {assembly?.assembly_id && nomenclature
                    ? dbDataHook.getSequenceNameForAssemblyNomenclature_byID(
                        gene.coordinates.sequence_id,
                        assembly.assembly_id,
                        nomenclature
                      )
                    : gene.coordinates.sequence_id
                  }
                  :{gene.coordinates.start.toLocaleString()}-{gene.coordinates.end.toLocaleString()}
                </code>
              </td>
              <td>
                <Badge bg="info">{gene.transcript_count}</Badge>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleViewInBrowser(gene)}
                    title={`View ${gene.name} in Genome Browser`}
                  >
                    View in Browser
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      const genePath = pathManager.getBasePath() + "/gene/" + gene.gid;
                      navigate(genePath);
                    }}
                    title="View gene details"
                  >
                    Details
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {pagination && pagination.total_pages > 1 && (
        <div className="mt-4">{renderPagination()}</div>
      )}
    </div>
  );
};

export default GeneSearchResults;