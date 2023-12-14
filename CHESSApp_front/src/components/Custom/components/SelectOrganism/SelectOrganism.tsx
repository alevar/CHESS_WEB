import { useState } from 'react';
import { useContext } from 'react';
import GlobalContext from '../../../GlobalContext';

interface Props {
  selection: string;
  onSelectionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  prop_className?: string;
}

function SelectOrganism(props: Props) {
  const { selection, onSelectionChange, onNextSlide, onPreviousSlide, prop_className } = props;

  const globalData = useContext(GlobalContext);

  const isSelectionMade = selection !== '';

  return (
    <div className={`${prop_className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div className="row" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <div className="col-md-6" style={{ borderRight: '1px solid #ccc', paddingRight: '15px' }}>
          {Object.entries(globalData.organisms).map(([key, value], index) => (
            <div className="form-check" key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                className="form-check-input"
                type="radio"
                name="selection1"
                value={value.commonName}
                checked={selection === value.commonName}
                onChange={onSelectionChange}
                style={{ marginRight: '10px' }}
              />
              <label className="form-check-label" style={{ marginRight: '20px' }}>
                {value.commonName}
              </label>
            </div>
          ))}
        </div>
        <div className="col-md-6 pl-md-5">
          <p>Some general text goes here.</p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', width: '100%' }}>
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
          <button className="btn btn-primary" onClick={onPreviousSlide}>
            Previous
          </button>
          <button className="btn btn-primary" onClick={onNextSlide} disabled={!isSelectionMade}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectOrganism;
