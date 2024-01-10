import { useState } from "react";
import VisualizeGene from "./VisualizeGene";
import * as d3 from "d3";

const GeneSearch = () => {
   // State for input values
   const [geneLocus, setGeneLocus] = useState<string>('');
   const [showVisualizeGene, setShowVisualizeGene] = useState<boolean>(false);
   const handleVisualizeClick = () => {
    // Perform any necessary logic with the geneLocus value
    // For now, let's just toggle the visibility of the VisualizeGene component
    setShowVisualizeGene(true);
  };
   return (
     <div>
       <div>
        <h3 style={{ marginTop: '15px', marginBottom: '15px' }}>Visualize Inputted Gene Locus</h3>


        <div className="input-group mb-3">
          <div className="input-group-text" id="basic-addon1">Gene Locus</div>
          <input type="text"
                className="form-control"
                placeholder="Gene Locus"
                aria-label="Gene Locus"
                aria-describedby="basic-addon1"
                onChange={(e) => setGeneLocus(e.target.value)} />
        </div>

        <button onClick={handleVisualizeClick}>Visualize Locus</button>
       </div>
        <hr style={{ border: '1px solid #ccc' }} />
        {showVisualizeGene && <VisualizeGene />}
      </div>
   );
 };
 
 export default GeneSearch;