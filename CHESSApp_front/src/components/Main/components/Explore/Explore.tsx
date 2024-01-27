import React from 'react';
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import SashimiPlot from './SashimiPlot/SashimiPlot';
import SideBar from './SideBar/SideBar';
import "./SideBar/SideBar.css";
import PDB from './PDB/PDB';

import { TX, Locus } from '../../../../utils/utils';

const Explore: React.FC = () => {

  const dimensions = {
    width: 1000,
    height: 300,
    arrowSize: 10,
    arrowSpacing: 50,
  }

  const txData_raw = [
    {"seqid":"chr18",
     "strand":"-",
     "tid":"CHS.24353.6",
     "gene_name":"KCTD1",
     "exons":[[26454910,26455901],[26459620,26459925],[26476515,26476659],[26501072,26501250],[26546728,26548553]],
     "cds":[26455746,26548536]},
    {"seqid":"chr18",
     "strand":"-",
     "tid":"CHS.24353.1",
     "gene_name":",KCTD1",
     "exons":[[26454910,26455901],[26459620,26459925],[26476515,26476659],[26501072,26501250],[26549244,26549435]],
     "cds":[26455746,26501235]},
    {"seqid":"chr18",
     "strand":"-",
     "tid":"CHS.24353.7",
     "gene_name":"KCTD1",
     "exons":[[26454910,26455901],[26459620,26459925],[26476515,26476659],[26501072,26501250],[26548891,26549435]],
     "cds":[26455746,26501235]},
    {"seqid":"chr18",
     "strand":"-",
     "tid":"CHS.24353.8",
     "gene_name":"KCTD1",
     "exons":[[26454910,26455901],[26459620,26459925],[26476515,26476659],[26501072,26501250],[26549729,26549819]],
     "cds":[26455746,26501235]},
    {"seqid":"chr18",
     "strand":"-",
     "tid":"CHS.24353.9",
     "gene_name":"KCTD1",
     "exons":[[26454910,26455901],[26459620,26459925],[26476515,26476659],[26501072,26501250],[26629147,26629237],[26640311,26640344]],
     "cds":[26455746,26501235]},
  ]

  const locus = new Locus();

  for (const tx of txData_raw) {
    const txObj = new TX();
    txObj.seqid = tx.seqid;
    txObj.strand = tx.strand;
    txObj.tid = tx.tid;
    txObj.add_attr("gene_name", tx.gene_name);
    for (const exon of tx.exons) {
      if (exon.length === 2) {
        txObj.add_exon(exon as [number, number]);
      }
    }
    txObj.build_orf(tx.cds[0], tx.cds[1]);

    locus.add_tx(txObj);
  }

  locus.set_scaling();
  
  const pdbData = "1MO8"; // eventually to be replaced with a query to the server for the appropriate PDB data

  return (
    <Container fluid>
      <Row>
        <Col className="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
          <SideBar />
        </Col>
        <Col className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Dashboard</h1>
          </div>
          <SashimiPlot locus={locus} dimensions={dimensions} />
          <PDB pdbData={pdbData} />
        </Col>
      </Row>
    </Container>
  );
}

export default Explore;
