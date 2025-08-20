import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useSearchParams } from 'react-router-dom';
import { searchGenes, searchGenesWithPage } from '../../redux/geneSearch';
import { GeneSearchBar, GeneSearchResults } from '../../components/geneSearch';
import { setPage, setGeneType, setPerPage, clearGeneSearch } from '../../redux/geneSearch';

import './Explore.css';

const Explore: React.FC = () => {
  const dispatch = useAppDispatch();
  const { genes, pagination, loading, error } = useAppSelector(state => state.geneSearch);
  const { selections } = useAppSelector(state => state.appData);
  const { sources } = useAppSelector(state => state.dbData);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedGeneType, setSelectedGeneType] = useState<string>('');
  const [perPage, setPerPage] = useState<number>(25);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Track previous selections to detect actual changes
  const prevSelections = useRef({
    sva_id: selections.sva_id,
    source_id: selections.source_id,
    version_id: selections.version_id,
    nomenclature: selections.nomenclature
  });
  
  // Initialize perPage from Redux state if available
  useEffect(() => {
    if (pagination?.per_page) {
      setPerPage(pagination.per_page);
    }
  }, [pagination?.per_page]);

  // Handle search query parameter from URL
  const lastSearchedQuery = useRef<string>('');

  // Handle search query parameter from URL
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery && selections.sva_id && searchQuery !== lastSearchedQuery.current) {
      // Auto-search when coming from header search
      setHasSearched(true);
      lastSearchedQuery.current = searchQuery;
      handleSearch(searchQuery);
    }
  }, [searchParams, selections.sva_id]);

  // Reset Explore page when app data changes (assembly, nomenclature, etc.)
  useEffect(() => {
    // Check if any selections have actually changed
    const hasChanged = 
      prevSelections.current.sva_id !== selections.sva_id ||
      prevSelections.current.source_id !== selections.source_id ||
      prevSelections.current.version_id !== selections.version_id ||
      prevSelections.current.nomenclature !== selections.nomenclature;
    
    // Only reset if selections have changed and we have valid selections
    if (hasChanged && (selections.sva_id || selections.source_id || selections.version_id || selections.nomenclature)) {
      // Reset search state when app selections change
      setHasSearched(false);
      setCurrentPage(1);
      lastSearchedQuery.current = '';
      
      // Clear search results using the proper action
      dispatch(clearGeneSearch());
      
      // Update previous selections
      prevSelections.current = {
        sva_id: selections.sva_id,
        source_id: selections.source_id,
        version_id: selections.version_id,
        nomenclature: selections.nomenclature
      };
    }
  }, [selections.sva_id, selections.source_id, selections.version_id, selections.nomenclature, dispatch]);

  // Get available gene types for the current configuration
  const getAvailableGeneTypes = () => {
    if (!selections.sva_id || !selections.source_id || !selections.version_id) {
      return null;
    }
    
    const source = sources[selections.source_id];
    if (!source?.versions) return null;
    
    const version = source.versions[selections.version_id];
    if (!version?.assemblies) return null;
    
    const assembly = version.assemblies[selections.sva_id];
    if (!assembly?.gene_types) return null;
    
    return assembly.gene_types.map(type => (
      <option key={type} value={type}>
        {type}
      </option>
    ));
  };

  const handleSearch = (searchTerm: string) => {
    setCurrentPage(1);
    setHasSearched(true);
    if (!selections.sva_id) {
      return; // Don't search if no sva_id is selected
    }
    
    // Update URL with search query
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newSearchParams.set('q', searchTerm.trim());
    } else {
      newSearchParams.delete('q');
    }
    setSearchParams(newSearchParams);
    
    dispatch(searchGenes({
      sva_id: selections.sva_id,
      search_term: searchTerm,
      gene_type: selectedGeneType || undefined,
      page: 1,
      per_page: perPage,
      sort_by: 'name',
      sort_order: 'asc'
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    dispatch(setPage(page));
    
    // Re-fetch with new page
    if (!selections.sva_id) {
      return;
    }
    // Note: We can't re-fetch without the original search term, so we'll just update the page
    // In a real app, you might want to store the search term in local state
  };





  return (
    <div className="explore-container">
      <Container>

      <Row className="mb-4">
        <Col>
              {!selections.sva_id ? (
                <div className="alert alert-warning">
                  <strong>No Configuration Selected:</strong> Please select a configuration from the app settings to enable gene search.
                </div>
              ) : (
                <div className="search-interface">
                  <Row className="align-items-end">
                    <Col md={9}>
                      <GeneSearchBar 
                        onSearch={handleSearch}
                        disabled={loading}
                        placeholder="Search genes..."
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Label>Gene Type Filter</Form.Label>
                      <Form.Select
                        value={selectedGeneType}
                        onChange={(e) => {
                          setSelectedGeneType(e.target.value);
                          dispatch(setGeneType(e.target.value || null));
                        }}
                      >
                        <option value="">All Gene Types</option>
                        {getAvailableGeneTypes()}
                      </Form.Select>
                    </Col>
                    <Col md={1}>
                      <Form.Label>Results per page</Form.Label>
                      <Form.Select
                        value={perPage}
                        onChange={(e) => {
                          const newPerPage = Number(e.target.value);
                          setPerPage(newPerPage);
                          // Reset to page 1 when changing per_page
                          setCurrentPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </Form.Select>
                    </Col>
                  </Row>
                  

                </div>
              )}
        </Col>
      </Row>

      {selections.sva_id && (
        <Row>
          <Col>
            <GeneSearchResults
              genes={genes}
              pagination={pagination}
              loading={loading}
              error={error}
              hasSearched={hasSearched}
              onPageChange={handlePageChange}
            />
          </Col>
        </Row>
      )}
        </Container>
      </div>
    );
};

export default Explore;