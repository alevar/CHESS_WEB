import { useState } from 'react';

interface Props {
  selection: string;
  onSelectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  prop_className?: string;
}

function SelectAssembly(props: Props) {
  const { selection, onSelectionChange, onNextSlide, onPreviousSlide, prop_className } = props;

  return (
    <div className={`${prop_className}`}>
      <div className="row">
        <div className="col-md-6 pr-md-5">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="selection1" value="option1" checked={selection === 'option1'} onChange={onSelectionChange} />
            <label className="form-check-label">
              Assembly 1
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="selection1" value="option2" checked={selection === 'option2'} onChange={onSelectionChange} />
            <label className="form-check-label">
              Assembly 2
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="selection1" value="option3" checked={selection === 'option3'} onChange={onSelectionChange} />
            <label className="form-check-label">
              Assembly 3
            </label>
          </div>
          <p>Active selection: {selection}</p>
          <button className="btn btn-primary" onClick={onPreviousSlide}>Previous</button>
          <button className="btn btn-primary" onClick={onNextSlide}>Next</button>
        </div>
        <div className="col-md-6 pl-md-5 border-left">
          <p>General information goes here</p>
        </div>
      </div>
    </div>
  );
}

export default SelectAssembly;