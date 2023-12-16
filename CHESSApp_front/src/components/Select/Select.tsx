import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { DatabaseState } from '../../features/database/databaseSlice';

interface RootState {
  database: DatabaseState;
}

function Select() {
  const data = useSelector((state: RootState) => state.database.data);

  return (
    <div>
      {Object.entries(data["assemblies"]).map(([key, value], index) => (
        <div key={index}>
          {key}: {value["assembly"]}
        </div>
      ))}
    </div>
  );
}

export default Select;