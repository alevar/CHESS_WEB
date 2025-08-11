import React from 'react';
import { Table, Badge, Pagination, Spinner, Alert, Button } from 'react-bootstrap';
import { Gene, GeneSearchPagination } from '../../types/geneTypes';
import { useAppSelector, useSelectedAssembly } from '../../redux/hooks';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const { selections } = useAppSelector(state => state.appData);
  const assembly = useSelectedAssembly();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper function to get proper sequence name from nomenclature
  const getSequenceName = (sequenceId: string) => {
    if (!assembly?.sequence_id_mappings || !selections.nomenclature) {
      return sequenceId;
    }
    
    // Get sequence name from nomenclature mappings
    const sequenceName = assembly.sequence_id_mappings[sequenceId]?.nomenclatures?.[selections.nomenclature];
    return sequenceName || sequenceId;
  };
  
  // Function to navigate to genome browser with gene coordinates
  const handleViewInBrowser = (gene: Gene) => {
    const sequenceName = getSequenceName(gene.coordinates.sequence_id);
    const geneLocation = `${sequenceName}:${gene.coordinates.start}-${gene.coordinates.end}`;
    
    // Get current URL path and replace /explore with /browser
    const currentPath = location.pathname;
    const browserPath = currentPath.replace('/explore', '/browser');
    
    // Navigate to genome browser page with current URL context
    navigate(browserPath, { 
      state: { 
        location: geneLocation,
        geneName: gene.name,
        geneId: gene.gene_id
      }
    });
  };
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Searching genes...</p>
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

  if (!hasSearched) {
    return null; // Don't show anything until a search is performed
  }

  const renderPagination = () => {
    if (!pagination) return null;

    const { current_page, total_pages, has_prev, has_next } = pagination;
    const pages = [];

    // Add previous button
    pages.push(
      <Pagination.Prev
        key="prev"
        disabled={!has_prev}
        onClick={() => has_prev && onPageChange(current_page - 1)}
      />
    );

    // Add page numbers
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

    // Add next button
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
        <h5>Search Results</h5>
        {pagination && (
          <span className="text-muted">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of{' '}
            {pagination.total_count} genes
          </span>
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
              <td>
                <strong>{gene.name}</strong>
              </td>
              <td>
                <code>{gene.gene_id}</code>
              </td>
              <td>
                <Badge bg="secondary">
                  {gene.type_value}
                </Badge>
              </td>
              <td>
                <div className="coordinates-info">
                  <div className="coordinate-string">
                    <code>{getSequenceName(gene.coordinates.sequence_id)}:{gene.coordinates.start.toLocaleString()}-{gene.coordinates.end.toLocaleString()}</code>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge bg-info">
                  {gene.transcript_count}
                </span>
              </td>
              <td>
                <div className="gene-actions">
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
                        // Navigate to the gene page using the gene's gid
                        navigate(`/gene/${gene.gid}`);
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
        <div className="mt-4">
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default GeneSearchResults; 