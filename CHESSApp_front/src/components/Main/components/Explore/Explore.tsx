import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import SideBar from './SideBar/SideBar';
import GeneTable from './ExploreGene/GeneTable/GeneTable';
import ExploreGene from './ExploreGene/ExploreGene';

import { useGetGenesSliceQuery } from '../../../../features/genes/genesApi';

// how do we link genessummary to txsummary in the database?
// solution - add primary key of the gene summary table to each entry in the transcript summary table
// that way we can select from both and join them to give a single result

const Explore: React.FC = () => {
  const { gene_id } = useParams();

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
            <GeneTable />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Explore;
