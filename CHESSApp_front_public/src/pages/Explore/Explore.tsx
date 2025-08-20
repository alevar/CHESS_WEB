import React, { useEffect } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';

import GeneSearchResults from './components/GeneSearchResults';
import GeneSearchBar from './components/GeneSearchBar';

import { useDbData, useAppData, useGeneSearch } from '../../hooks';
import { searchGenes } from '../../redux/geneSearch/geneSearchThunks';

import './Explore.css';

const Explore: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dbDataHook = useDbData();
  const appDataHook = useAppData();
  const geneSearchHook = useGeneSearch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived data from app selections
  const appData = appDataHook.getAppData();
  const sva = appData.selections.source_id && appData.selections.version_id && appData.selections.assembly_id
    ? dbDataHook.getSourceVersionAssembly_byID(
        appData.selections.source_id, 
        appData.selections.version_id, 
        appData.selections.assembly_id
      )
    : undefined;
  const geneTypes = sva?.gene_types || [];

  // Gene search state
  const { genes, pagination, loading, error } = geneSearchHook.getGeneSearch();

  // Parse URL parameters
  const currentQuery = searchParams.get('q') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentGeneType = searchParams.get('geneType') || '';
  const currentPerPage = Number(searchParams.get('perPage')) || 25;

  console.log('currentQuery', currentQuery);

  // Update URL parameters
  const updateSearchParams = (updates: Record<string, string | number | null>) => {
    console.log('updateSearchParams', updates);
    setSearchParams(prevParams => {
      const newSearchParams = new URLSearchParams(prevParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value.toString());
        }
      });

      return newSearchParams;
    });
  };

  // Perform search
  const performSearch = (searchTerm: string, page: number = 1, geneType?: string, resultsPerPage?: number) => {
    console.log('performSearch', searchTerm, page, geneType, resultsPerPage);
    if (!sva) return;

    dispatch(searchGenes({
      sva_id: sva.sva_id,
      search_term: searchTerm,
      gene_type: geneType || undefined,
      page,
      per_page: resultsPerPage,
      sort_by: 'name',
      sort_order: 'asc'
    }));
  };

  // Handle search - only called on enter/search button
  const handleSearch = (searchTerm: string) => {
    console.log('handleSearch', searchTerm);
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;
    updateSearchParams({
      q: trimmedTerm,
      page: 1,
      geneType: currentGeneType || null,
      perPage: currentPerPage
    });
  };

  // Handle page/filter changes
  const handlePageChange = (page: number, updates?: { geneType?: string; perPage?: number }) => {
    console.log('handlePageChange', page, updates);
    const newGeneType = updates?.geneType ?? currentGeneType;
    const newPerPage = updates?.perPage ?? currentPerPage;

    updateSearchParams({
      page,
      geneType: newGeneType || null,
      perPage: newPerPage
    });
  };

  // Perform search when URL parameters change (but not from typing)
  useEffect(() => {
    if (currentQuery && sva) {
      performSearch(currentQuery, currentPage, currentGeneType, currentPerPage);
    }
  }, [currentQuery, currentPage, currentGeneType, currentPerPage, sva?.sva_id]);

  // Early return if no configuration
  if (!sva) {
    console.log('if (!sva)');
    return (
      <div className="explore-container">
        <Container>
          <Row className="mb-4">
            <Col>
              <Alert variant="warning" className="mb-0">
                <strong>No Configuration Selected:</strong> Please select a configuration from the app settings to enable gene search.
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="explore-container">
      <Container>
        {/* Search Interface */}
        <Row className="mb-4">
          <Col>
            <Row className="align-items-end">
              <Col md={9} className="mb-3 mb-md-0">
                <GeneSearchBar
                  onSearch={handleSearch}
                  placeholder="Search genes..."
                  value={currentQuery}
                />
              </Col>
              <Col md={2} className="mb-3 mb-md-0">
                <Form.Group controlId="geneTypeFilter">
                  <Form.Label>Gene Type Filter</Form.Label>
                  <Form.Select
                    value={currentGeneType}
                    onChange={e => handlePageChange(1, { geneType: e.target.value })}
                  >
                    <option value="">All Gene Types</option>
                    {geneTypes.map((geneType) => (
                      <option key={geneType} value={geneType}>
                        {geneType}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group controlId="resultsPerPage">
                  <Form.Label>Results per page</Form.Label>
                  <Form.Select
                    value={currentPerPage}
                    onChange={e => handlePageChange(1, { perPage: Number(e.target.value) })}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Search Results */}
        <Row>
          <Col>
            <GeneSearchResults
              genes={genes}
              pagination={pagination}
              loading={loading}
              error={error}
              hasSearched={!!currentQuery}
              onPageChange={handlePageChange}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Explore;