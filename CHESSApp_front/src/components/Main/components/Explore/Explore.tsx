import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';

import SideBar from './SideBar/SideBar';
import GeneSearch from './ExploreGene/GeneSearch/GeneSearch';
import GeneTable from './ExploreGene/GeneTable/GeneTable';
import ExploreGene from './ExploreGene/ExploreGene';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState } from '../../../../features/settings/settingsSlice';

import { useGetLociSummaryQuery } from '../../../../features/loci/lociApi';

// when a user lands on explore - present all genes
// filtering will only work within the currently displayed panel

// alternatively, user can type in a custom search which will trigger a server response of everything that matches the search
// and a table presented will only contain relevant results

// how do we link genessummary to txsummary in the database?
// solution - add primary key of the gene summary table to each entry in the transcript summary table
// that way we can select from both and join them to give a single result

interface RootState {
  database: DatabaseState;
  settings: SettingsState;
}

const Explore: React.FC = () => {
  const { gene_id } = useParams();

  const settings = useSelector((state: RootState) => state.settings);

  const { data, error, isLoading } = useGetLociSummaryQuery(settings.value);

  if (isLoading) {
    return (
      <div className="loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const geneData = {
    GeneName: ['GeneA', 'GeneB', 'GeneC'],
    ExpressionLevel: [10, 20, 15],
    Chromosome: ['chr1', 'chr2', 'chr3'],
  };

  const handleSearch = (query: string) => {
    
  };

  return (
    <Container fluid>
      <Row>
        <Col className="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
          <SideBar />
        </Col>
        <Col id="mainView" className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {gene_id ? (
            <ExploreGene/>
          ) : (
            <div>
              <GeneSearch onSearch={handleSearch} />
              <GeneTable data={geneData} />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Explore;
