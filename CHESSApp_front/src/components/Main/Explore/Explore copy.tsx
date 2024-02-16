import React from 'react';
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import SashimiPlot from './ExploreGene/SashimiPlot/SashimiPlot';
import SideBar from './SideBar/SideBar';
import GeneTable from './ExploreGene/GeneTable/GeneTable';
import PDB from './ExploreGene/PDB/PDB';

import { TX, Locus } from '../../../utils/utils';

const Explore: React.FC = () => {

  // when explore component loads - display a table with genes listed as a table along with some stats
  // items of the list can be filtered via the same settings panel as custom
  // genes can be enetered for additional information by clicking on them

  // SashimiPlot TX clicker
  const handleTXClick = (tx: TX) => {
    console.log(tx);
  };

  const dimensions = {
    width: 1000,
    height: 300,
    arrowSize: 10,
    arrowSpacing: 50,
  };

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
        <Col id="mainView" className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <GeneTable></GeneTable>
          {/* Top Div with Text */}
          <div className="mb-3 border-bottom">
            <h2>Lorem Ipsum Text</h2>
          </div>

          {/* Two Columns Split 10 to 2 */}
          <Row>
            <Col md={10}>
              <SashimiPlot locus={locus} dimensions={dimensions} onTxClick={handleTXClick} />
            </Col>
            <Col md={2}>
              {/* Empty column */}
            </Col>
          </Row>

          {/* Single Column Space with PDB and Text */}
          <Row>
            <Col>
              <div>
                <h2>PDB</h2>
                <p>Lorem Ipsum Text</p>
              </div>
              <PDB pdbData={pdbData} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Explore;
