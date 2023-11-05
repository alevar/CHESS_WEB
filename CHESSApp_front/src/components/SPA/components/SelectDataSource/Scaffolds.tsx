import React, { useState } from 'react';

interface Props {
  selected_scaffolds: string[]
  setScaffolds: (event: any) => void;
}

export function Scaffolds(props: Props) {
  const {selected_scaffolds, setScaffolds} = props;

  return (
    <>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          value="Alt"
          type="checkbox"
          role="switch"
          id="altOption"
          onChange={setScaffolds}
        />
        <label className="form-check-label" htmlFor="altOption">Alt</label>
      </div>

      <div className="form-check form-switch">
        <input
          className="form-check-input"
          value="Random"
          type="checkbox"
          role="switch"
          id="randomOption"
          onChange={setScaffolds}
        />
        <label className="form-check-label" htmlFor="randomOption">Random</label>
      </div>

      <div className="form-check form-switch">
        <input
          className="form-check-input"
          value="Unplaced"
          type="checkbox"
          role="switch"
          id="unplacedOption"
          onChange={setScaffolds}
        />
        <label className="form-check-label" htmlFor="unplacedOption">Unplaced</label>
      </div>

      <div className="form-check form-switch">
        <input
          className="form-check-input"
          value="Scaffold"
          type="checkbox"
          role="switch"
          id="scaffoldOption"
          onChange={setScaffolds}
        />
        <label className="form-check-label" htmlFor="scaffoldOption">Scaffold</label>
      </div>

      <p className="font-italic">Active selection: {selected_scaffolds.length > 0 ? selected_scaffolds.join(", ") : "None"}</p> 
    </>
  );
};