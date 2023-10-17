import { CheckboxWithText } from "./CheckboxWithText";
import {useState, useEffect} from 'react';

export function ScaffoldCheckboxes() {
    let [dataSources, setDataSources] = useState<string[]>([])
  
    useEffect(() => {
        //fetch("some_url")
        // .then(response => response.json())
        // .then(data => setDataSources(data.message))
        const currDataSources = ["Alt","Random","Unplaced","Patches","Primary"]
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
