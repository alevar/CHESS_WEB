import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

import Spinner from 'react-bootstrap/Spinner';
import SashimiPlot from './SashimiPlot/SashimiPlot';
import TxTable from './TxTable/TxTable';
import PDB from './PDB/PDB';

import { TX, Locus } from '../../../../../utils/utils';

import { DatabaseState } from '../../../../../features/database/databaseSlice';
import { SettingsState } from '../../../../../features/settings/settingsSlice';
import { useGetLocusQuery } from '../../../../../features/loci/lociApi';

interface ExploreProps {
    locusID: number,
}

interface RootState {
    database: DatabaseState;
    settings: SettingsState;
}

const Explore: React.FC<ExploreProps> = ({ locusID }) => {
    const settings = useSelector((state: RootState) => state.settings);
    const database = useSelector((state: RootState) => state.database);

    const { data: locusData, error: locusError, isLoading: locusLoading } = useGetLocusQuery(locusID);

    if (locusLoading) {
        return (
            <div className="loading">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (locusError) {
        return <div>Error: {lociError}</div>;
    }

    // all deduplicated transcripts at locus
    // when transcript selected - shows
    //    - sashimi of transcripts for eachsource(unique ORFs, UTRs, etc)

    // when explore component loads - display a table with genes listed as a table along with some stats
    // items of the list can be filtered via the same settings panel as custom
    // genes can be enetered for additional information by clicking on them

    // SashimiPlot TX clicker
    const handleTXClick = (tx: TX) => {
        console.log(tx);
    };

    const dimensions = {
        width: 1000,
        tx_height: 50,
        arrowSize: 10,
        arrowSpacing: 50,
    };

    const locus = new Locus();

    for (const [tid, txData] of Object.entries(locusData.data.transcripts)) {
        const txObj = new TX();
        const seqid_name = database.data.sequenceIDMap[settings.value.genome][locusData.position.seqid][settings.value.nomenclature];
        txObj.tid = tid;
        for (const exon of txData.exons) {
            txObj.add_exon(exon as [number, number]);
        }
        // txObj.build_orf(txData.cds_start, txData.cds_end);
        locus.add_tx(txObj);
    }
    locus.set_scaling();

    const pdbData = "1MO8"; // eventually to be replaced with a query to the server for the appropriate PDB data


    const mockData = Array.from({ length: 10 }, (_, rowIndex) => ({
        id: rowIndex,
        column0: `Row ${rowIndex + 1}, Col 1`,
        column1: `Row ${rowIndex + 1}, Col 2`,
        // Add other columns as needed
      }));

    return (
        <Container fluid>
            <Row>
                <Col md={10}>
                    <TxTable data={mockData} />
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
        </Container >
    );
}

export default Explore;
