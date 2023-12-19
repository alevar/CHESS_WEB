import React, { useState, useMemo } from 'react';
import { UpSetJS, extractCombinations, asCombinations } from '@upsetjs/react';
import { createSetComposite } from '@upsetjs/plots/src/selections/single'

function SelectOrganism() {
  const [selection, setSelection] = useState(null);

  const handleSelectionChange = (set) => {
    let new_set = createSetComposite([combinations[0],combinations[1]]);
    setSelection(new_set);
  }

  const elems = [
      { name: 'A', sets: ['S1', 'S2'] },
      { name: 'B', sets: ['S1'] },
      { name: 'C', sets: ['S2'] },
      { name: 'D', sets: ['S1', 'S3'] },
    ];
  const { sets, combinations } = useMemo(() => extractCombinations(elems), [elems]);

  return (
    <UpSetJS
      sets={sets}
      combinations={combinations}
      width={500}
      height={300}
      selection={selection}
      onClick={handleSelectionChange}
    />
  );
}
export default SelectOrganism;