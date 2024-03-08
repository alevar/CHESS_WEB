import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Table } from "react-bootstrap";

import Spinner from 'react-bootstrap/Spinner';
import TxTable from './TxTable/TxTable';
import PDB from './PDB/PDB';

import { TX, Locus } from '../../../../utils/utils';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState } from '../../../../features/settings/settingsSlice';
import { useGetLocusQuery } from '../../../../features/loci/lociApi';

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
        return <div>Error: {locusError}</div>;
    }

    // SashimiPlot TX clicker
    const handleTXClick = (tx: TX) => {
        console.log(tx);
    };

    const locus = new Locus();

    console.log("transcripts", locusData.data.transcripts);
    for (const [tid, txData] of Object.entries(locusData.data.transcripts)) {
        const txObj = new TX();
        const seqid_name = database.data.sequenceIDMap[settings.value.genome][locusData.position.seqid][settings.value.nomenclature];
        txObj.tid = tid;
        for (const exon of txData.exons) {
            txObj.add_exon(exon as [number, number]);
        }

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
        txObj.orf = txObj.txs[0].orf;
        console.log("txObj", txObj);
        locus.add_tx(txObj);
    }
    locus.set_scaling();

    const pdbData = "1MO8"; // eventually to be replaced with a query to the server for the appropriate PDB data

    const gene_name_set = new Set(Object.values(locusData.data.genes).map(g => g.gene_name));
    const gene_name_str = Array.from(gene_name_set).join(', ');

    const colorizeBetweenPositions = (sequence: string, startPosition: number, endPosition: number) => {
        // Remove whitespaces from the sequence
        const sequenceWithoutSpaces = sequence.replace(/\s/g, '');

        // Highlight the text between positions
        const highlightedSequence =
            sequenceWithoutSpaces.slice(0, startPosition) +
            `<span style="background-color: #56b4e9">${sequenceWithoutSpaces.slice(startPosition, endPosition)}</span>` +
            sequenceWithoutSpaces.slice(endPosition);

        return <div dangerouslySetInnerHTML={{ __html: highlightedSequence }} />;
    };

    return (
        <Container fluid>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col>
                    <h1>{gene_name_str}</h1>
                </Col>
            </Row>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col>
                    <h2></h2>
                    <Table striped bordered hover>
                        <thead>
                        </thead>
                        <tbody>
                            <p>
                                <strong>Gene Name:</strong> {gene_name_str}
                            </p>
                            <p>
                                <strong>Gene ID:</strong> HGNC: 1976 NCBI Gene: 1149 Ensembl: ENSG00000176194 OMIM®: 604440 UniProtKB/Swiss-Prot: O60543 
                            </p>
                            <p>
                                <strong>Description:</strong>This gene encodes the homolog of the mouse protein Cidea that has been shown to activate apoptosis. This activation of apoptosis is inhibited by the DNA fragmentation factor DFF45 but not by caspase inhibitors. Mice that lack functional Cidea have higher metabolic rates, higher lipolysis in brown adipose tissue and higher core body temperatures when subjected to cold. These mice are also resistant to diet-induced obesity and diabetes. This suggests that in mice this gene product plays a role in thermogenesis and lipolysis. Alternatively spliced transcripts have been identified.
                            </p>
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col md={10}>
                    <TxTable locus={locus} onTxClick={handleTXClick} />
                </Col>
            </Row>

            <Row>
                <Col md={6} style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>

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
                    <div style={{ wordWrap: 'break-word' }}>
                        {colorizeBetweenPositions(`
                        AGGCCCGCTAGGGGATCCGCGCCATGGAGGCCGCCCGGGACTATGCAGGAGCCCTCATCAGGCGAGTGCC
                        CCGCGTCCCCCTGATTGCCGTGCGCTTCCAATCGCCTTGCGTTCGGTGGCCTCATATTCCCCTGTGCGCC
                        TCTAGTACCGTACCCCGCTCCCTTCAGCCCCCTGCTCCCCGCATTCTCTTGCGCTCCGCGACCCCGCGCA
                        CACACCCATCCGCCCCACTGGTGCCCAAGCCGTCCAGCCGCGCCCGCGGGCAGAGCCCAATCCCGTCCCG
                        CGCCTCCTCACCCTCTTGCAGCTGGGCACAGGTACCAGGTGTGGCTCTTGCGAGGTGCGCGGGCGTCTGC
                        AAACCAGGTGACAGCTGGCGAGTGGCTGCATGCATCTCTGGCCGCTGCTGCAGTCGCGGGCGCAGAAGAG
                        GGTCCGGTCCCAGGAACCCCGAGCAAAGCTTCCGCGATGCGAGGGGACCGGGCTTCTGGGGGTCCTGGAA
                        ATCACAACGGGAGCTGGGCGCGGGAGGGGCCCAGGCTTGGCCCCTCCTGGAAGCGCGGGCTCTGGTCTCC
                        GAGGGGAGGCCCCAACCGTCCGGCGGAGCCCTCCAGGCCCCTGACATTTATGGGATCACAGACTAAGCGA
                        GTCCTGTTCACCCCGCTCATGCATCCAGCTCGCCCTTTCCGGGTCTCCAACCATGACAGGAGCAGCCGGC
                        GTGGGGTGATGGCAAGCAGCCTGCAGGAGCTCATCAGCAAGGGAGGATGCAGGGATGGAGCCGACTTTGG
                        AAGTCTGGGTTTGGTTGTAAAGGCCAGGATCTAGAACAGTGTCCTAGACCACCAAATAAGGAAGAATCCC
                        AGCCTCTCAGAGAAGCATAACTCAGACTCAGGCACCCATGGAAACAAGAAACAAGCATCCAACATGCAGT
                        CTCTGAAGCAAGAGAGACACTCAGCTACGCACACGAGGCTGTGGCTCTTACAGCAGCAAACATGCAAGAG
                        CTTTCTTTTTATTCATCTAAATAAATAGACTCTGGATGCCCTCGTCATCGCTACCGGACTGGTCACTCTG
                        GTGCTGGAGGAAGATGGCACCGTGGTGGACACAGAAGAGTTCTTTCAGACCTTGGGAGACAACACGCATT
                        TCATGATCTTGGAAAAAGGACAGAAGTGGATGCCGGGCAGCCAGCACGTCCCCACTTGCTCGCCGCCGAA
                        GAGGTCGGGAATAGCGAGAGTCACCTTCGACTTGTACAGGCTGAACCCCAAGGACTTCATCGGCTGCCTT
                        AACGTGAAGGCCACCATGTATGAGATGTACTCCGTGTCCTACGACATCCGGTGCACGGGACTCAAGGGCC
                        TGCTGAGGAGTCTGCTGCGGTTCCTGTCCTACTCCGCCCAGGTGACGGGACAGTTTCTCATCTATCTGGG
                        CACATACATGCTCCGGGTGCTGGATGACAAGGAAGAGCGGCCATCCCTCCGGTCACAAGCCAAGGGCAGG
                        TTCACGTGTGGATAGGGATGCAGGCTGTCGCCGGCTCTTGAGCCAAACACTGTGTTTCGTTTGGCTCAAT
                        GACGAATGTTGAAGATGCTTTTATGTTCTGAGCCACATGCACTTGGAGGCCGCTGGTCACGCTGCTCAGG
                        AGTGGTGCCCAGAAAAGGAAAGGGCTTGGTGGTACATGAAGTGGGGGCAGTGGGCAGGGTGCCCTGGGGG
                        GGAGGCATAGAGGGCCCTGGGGGTCATGGGAAGCGAGCACGCAGCAGGCGTGCCCAGGAGCGTGTGCATG
                        TGTCAGAGCCATTTGGTCCATCATCTCCTGCAATAAACCCATCGCAAGAATGACCTTCAA
    `, 1122, 1511)}
                    </div>
                </Col>
            </Row>
            <Row style={{ border: '1px solid #d6d6d6', borderRadius: '5px' }}>
                <Col>
                    <h2>Protein Sequence</h2>
                    <div style={{ wordWrap: 'break-word' }}>
                        MILEKGQKWMPGSQHVPTCSPPKRSGIARVTFDLYRLNPKDFIGCLNVKATMYEMYSVSYDIRCTGLKGL
                        LRSLLRFLSYSAQVTGQFLIYLGTYMLRVLDDKEERPSLRSQAKGRFTCG
                    </div>
                </Col>
            </Row>
        </Container >
    );
}

export default Explore;
