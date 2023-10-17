import { DataSourceCheckboxes } from "./components/DataSourceCheckboxes";
import { RadioGroupUnionInt } from "./components/RadioGroupUnionInt";
import { DataTableDemo } from "./components/tissueTable/dataTable.tsx"
import { ScaffoldCheckboxes } from "./components/ScaffoldCheckboxes.tsx";
import { Button } from "./components/ui/button.tsx";

function App() {

  return (
    

    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Generate GTF File</h1>
      <h1 className="text-1xl font-bold">Select Data Source(s)</h1>
      <DataSourceCheckboxes/>

      <h1 className="text-1xl font-bold">Operation</h1>
      <RadioGroupUnionInt/>

      <h1 className="text-1xl font-bold">Select Tissue Type(s)</h1>
      <DataTableDemo/>

      <h1 className="text-1xl font-bold">Scaffold(s)</h1>
      <ScaffoldCheckboxes/>

      <Button>Download GTF</Button>

    </div>
  );
}

export default App;
