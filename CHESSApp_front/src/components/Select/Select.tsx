import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

function Select() {
  const sequences = useSelector(state => state.database.sequences); // Adjust based on your actual state structure

  return (
    <div>
      {sequences.map((sequence, index) => (
        <button key={index}>{sequence}</button>
      ))}
    </div>
  );
}

export default Select;