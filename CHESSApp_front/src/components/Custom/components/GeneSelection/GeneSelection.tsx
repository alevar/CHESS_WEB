import React, { useState } from 'react';
import { extractSets, generateCombinations, UpSetJS, ISetLike } from '@upsetjs/react';

const GeneSelection = () => {
  // Define your elements here
  const elements = [
    { name: 'A', sets: ['Set1', 'Set2'] },
    { name: 'B', sets: ['Set1'] },
    { name: 'C', sets: ['Set2'] },
  ];

  const sets = extractSets(elements);
  let combinations = generateCombinations(sets);

  const [selection, setSelection] = useState<ISetLike[]>([]);

  sets[0].cardinality = 1000;

  const handleClick = (set: ISetLike | null) => {
    if (set) {
      console.log(sets)
      console.log(combinations)
      setSelection(set);
    }
  };

  return (
    <div>
      <UpSetJS
        sets={sets}
        combinations={combinations}
        width={500}
        height={500}
        selection={selection}
        onClick={handleClick}
      />
    </div>
  );
};

export default GeneSelection;