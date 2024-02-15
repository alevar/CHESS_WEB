import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';

import SideBar from '../SideBar/SideBar';
import GeneSearch from './ExploreGene/GeneSearch/GeneSearch';
import GeneTable from './ExploreGene/GeneTable/GeneTable';
import ExploreGene from './ExploreGene/ExploreGene';

import { DatabaseState } from '../../../../features/database/databaseSlice';
import { SettingsState } from '../../../../features/settings/settingsSlice';

import { useGetLociSummaryQuery,
         useFindLociQuery } from '../../../../features/loci/lociApi';

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
  const navigate = useNavigate();

  const { locus_id } = useParams();
  const settings = useSelector((state: RootState) => state.settings);
  const database = useSelector((state: RootState) => state.database);

  const [query, setQuery] = React.useState<any>({"genome":settings.value.genome,"term":"TUBB8B"});
  const { data: lociData, error: lociError, isLoading: lociLoading } = useFindLociQuery(query);

  // create a copy of the data to be used by the component. The lociData will stay untouched to reflect the 
  // latest update, while the copy will be modified to be in sync with the settings
  const [tableData, setTableData] = useState<{}>({"columns": ["locusID", "Position"], "loci": []});

  // Update columns whenever lociData or settings change
  useEffect(() => {
    // Modify this logic based on how you want to create const columns
    // For example, assuming lociData is an array of objects, and you want to use keys as columns
    if (lociData) {
      const tmpData = {"columns": [
        "locusID",
        "Position"
      ], "loci": []};
      
      for (const sourceID of settings.value.sources_include){
        tmpData.columns.push(database.data["sources"][sourceID].name + " Gene ID");
        tmpData.columns.push(database.data["sources"][sourceID].name + " Gene Name");
      }

      for (const row of lociData) {
        // check if for any of the sources, the geneID is not null
        let include = false;
        for (const sourceID of settings.value.sources_include) {
          if ( !(row["sources"][sourceID]["gene_id"] === null) ) {
            include = true;
            break;
          }
        }
        if (!include) {
          continue;
        }

        const strand = row["strand"] === 1 ? "+" : "-";
        const tmpRow = [
          row["locusID"],
          row["seqid"] + strand + ":" + row["start"] + "-" + row["end"],
        ];
        for (const sourceID of settings.value.sources_include){
          tmpRow.push(row["sources"][sourceID]["gene_id"]);
          tmpRow.push(row["sources"][sourceID]["gene_name"]);
        }
        
        tmpData.loci.push(tmpRow);
      }

      setTableData(tmpData);
    }
  }, [lociData, settings.value.sources_include, settings.value.source_intersections]);

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
    return <div>Error: {lociError}</div>;
  }
  
  const handleSearch = (newQuery: string) => {
    setQuery({"genome": settings.value.genome, "term": newQuery});
  };

  const handleRowClick = (row: any[]) => {
    // navigate to the requested locus
    navigate(`${location.pathname}/${row[0]}`)
  };

  return (
    <Container fluid>
      <Row>
        <Col className="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
          <SideBar />
        </Col>
        <Col id="mainView" className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {locus_id ? (
            <ExploreGene locusID={locus_id}/>
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
