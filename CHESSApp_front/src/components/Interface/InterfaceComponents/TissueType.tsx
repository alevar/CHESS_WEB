import { TissueTable, TissueData } from "../../ui/TissueTable";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

// Usage example:
const tissueData: TissueData[] = [
  { tissue: 'Brain', numSamples: 913 },
  { tissue: 'Liver', numSamples: 3417 },
  { tissue: 'Pancreas', numSamples: 1234 },
  // Add more tissues as needed
];

const TissueType = () => {
  return (
    <>

      <div className = "mt-4">
          <TissueTable data={tissueData} />
      </div>

      <Link to="/interface/scaffold">
        <Button>Next</Button>
      </Link> 
    </>
  )
}

export default TissueType