import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Table } from "react-bootstrap";

import Spinner from 'react-bootstrap/Spinner';
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
    const [tableData, setTableData] = useState<[]>([]);

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

    // SashimiPlot TX clicker
    const handleTXClick = (tx: TX) => {
        console.log(tx);
    };

    const locus = new Locus();

    for (const [tid, txData] of Object.entries(locusData.data.transcripts)) {
        const txObj = new TX();
        const seqid_name = database.data.sequenceIDMap[settings.value.genome][locusData.position.seqid][settings.value.nomenclature];
        txObj.tid = tid;
        for (const exon of txData.exons) {
            txObj.add_exon(exon as [number, number]);
        }
        txObj.build_orf(txData.cds_start, txData.cds_end);

        // now build and add source-specific versions
        for (const [sourceID, sourceData] of Object.entries(txData.sources)) {
            for (const [gid, geneData] of Object.entries(sourceData)) {
                const sub_tx = new TX();
                sub_tx.set_parent(txObj.tid);
                sub_tx.set_gene(gid, locusData.data.genes[gid].gene_id, locusData.data.genes[gid].gene_name);
                sub_tx.tid = geneData.transcript_id;
                for (const exon of txData.exons) {
                    sub_tx.add_exon(exon as [number, number]);
                }
                sub_tx.set_start(geneData.transcript_start);
                sub_tx.set_end(geneData.transcript_end);
                sub_tx.build_orf(geneData.cds_start, geneData.cds_end);
                txObj.add_tx(sub_tx);
            }
        }
        locus.add_tx(txObj);
    }
    locus.set_scaling();

    const pdbData = "1MO8"; // eventually to be replaced with a query to the server for the appropriate PDB data

    const gene_name_set = new Set(Object.values(locusData.data.genes).map(g => g.gene_name));
    const gene_name_str = Array.from(gene_name_set).join(', ');
    return (
        <Container fluid>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col>
                    <h1>{gene_name_str}</h1>
                </Col>
            </Row>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col md={10}>
                    <TxTable locus={locus} onTxClick={handleTXClick} />
                </Col>
            </Row>

            <Row>
                <Col id="txInfoTable" md={6} style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                    <h2>Transcript Info</h2>
                    <Table striped bordered hover>
                        <thead>
                        </thead>
                        <tbody>
                            
                        </tbody>
                    </Table>
                </Col>
                <Col md={6} style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                    <div>
                        <h2>AlphaFold 2</h2>
                    </div>
                    <PDB pdbData={gene_name_str} />
                </Col>
            </Row>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col>
                    <h2>Transcript Sequence</h2>
                    <div>
                        
                    </div>
                </Col>
            </Row>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col>
                    <h2>Protein Sequence</h2>
                    <div>
                        
                    </div>
                </Col>
            </Row>
        </Container >
    );
}

export default Explore;
