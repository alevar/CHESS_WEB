import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner } from "react-bootstrap";

import SideBar from './SideBar/SideBar';
import GeneSearch from './ExploreGene/GeneSearch/GeneSearch';
import GeneTable from './ExploreGene/GeneTable/GeneTable';
import ExploreGene from './ExploreGene/ExploreGene';

import { RootState } from '../../../app/store';

import { useGetLociSummaryQuery, useFindLociQuery } from '../../../features/loci/lociApi';

import './Explore.css';

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { locus_id } = useParams();
  const settings = useSelector((state: RootState) => state.settings);
  const database = useSelector((state: RootState) => state.database);

  const [query, setQuery] = useState<any>({"genome": settings.value.genome, "term": "TUBB8B"});
  const { data: lociData, error: lociError, isLoading: lociLoading } = useFindLociQuery(query);

  const [tableData, setTableData] = useState<{}>({"columns": ["locusID", "Position"], "loci": []});

  useEffect(() => {
    if (lociData) {
      const tmpData = {
        "columns": ["locusID", "Position"],
        "loci": []
      };

      for (const sourceID of settings.value.sources_include) {
        tmpData.columns.push(`${database.data["sources"][sourceID].name} Gene ID`);
        tmpData.columns.push(`${database.data["sources"][sourceID].name} Gene Name`);
      }

      for (const row of lociData) {
        let include = false;
        for (const sourceID of settings.value.sources_include) {
          if (row["sources"][sourceID]["gene_id"] !== null) {
            include = true;
            break;
          }
        }
        if (!include) continue;

        const strand = row["strand"] === 1 ? "+" : "-";
        const tmpRow = [
          row["locusID"],
          `${row["seqid"]}${strand}:${row["start"]}-${row["end"]}`,
        ];
        for (const sourceID of settings.value.sources_include) {
          tmpRow.push(row["sources"][sourceID]["gene_id"]);
          tmpRow.push(row["sources"][sourceID]["gene_name"]);
        }

        tmpData.loci.push(tmpRow);
      }

      setTableData(tmpData);
    }
  }, [lociData, settings.value.sources_include, settings.value.source_intersections]);

  const handleSearch = (newQuery: string) => {
    setQuery({"genome": settings.value.genome, "term": newQuery});
  };

  const handleRowClick = (row: any[]) => {
    navigate(`${location.pathname}/${row[0]}`);
  };

  if (lociLoading) {
    return (
      <div className="loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (lociError) {
    return <div>Error: {lociError.message}</div>;
  }

  return (
    <Container fluid className="explore-container">
      <Row>
        <Col className="sidebar col-md-3 col-lg-2 p-0">
          <SideBar />
        </Col>
        <Col id="mainView" className="main-view col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {locus_id ? (
            <ExploreGene locusID={locus_id} />
          ) : (
            <div>
              <GeneSearch onSearch={handleSearch} />
              <GeneTable data={tableData} onRowClick={handleRowClick} />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Explore;
