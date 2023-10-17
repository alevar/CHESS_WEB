import { CheckboxWithText } from "./CheckboxWithText";
import {useState, useEffect} from 'react';

export function DataSourceCheckboxes() {
    let [dataSources, setDataSources] = useState<string[]>([])
  
    useEffect(() => {
        //fetch("some_url")
        // .then(response => response.json())
        // .then(data => setDataSources(data.message))
        const currDataSources = ["CHESS","GENCODE","RefSeq"]
        setDataSources(currDataSources)
    },[])

    return (
        <div className="items-top flex space-x-2">
          {dataSources.map((source, index) => (
            <div key={index} className="grid gap-1.5 leading-none">
              <CheckboxWithText label={source} />
            </div>
          ))}
        </div>
    );

}
