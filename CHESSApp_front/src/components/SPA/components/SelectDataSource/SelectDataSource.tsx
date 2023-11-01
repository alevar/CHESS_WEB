import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';


interface Props {
  selection: string;
  onSelectionChange: (event: any) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  prop_className?: string;
}

function SelectDataSource(props: Props) {
  const { selection, onSelectionChange, onNextSlide, onPreviousSlide, prop_className } = props;
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleSelection = (selected: string) => {
    onSelectionChange(selected);
  };


  return (
    <div className={`${prop_className}`}>
      <div className="row">
        <div className="col-md-6 pr-md-5">
            <Button variant="secondary" onClick={onSelectionChange}>CHESS.3.0</Button>{' '}
            <Button variant="secondary" onClick={onSelectionChange}>CHESS.3.0.1</Button>{' '}
            <Button variant="secondary" onClick={onSelectionChange}>CSESS</Button>{' '}
            <Button variant="secondary" onClick={onSelectionChange}>GENCODE</Button>{' '}
            <Button variant="secondary" onClick={onSelectionChange}>MANE</Button>{' '}
            <Button variant="secondary" onClick={onSelectionChange}>RefSeq</Button>{' '}

          <p>Active selection: {selection}</p>
 
        <div className='p-4'>
            <Button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                aria-expanded={showAdvancedOptions}
                className="btn-sm btn-warning">
                Advanced Options
            </Button>

            <Collapse in={showAdvancedOptions}>
                <div className="center">
                    <Button variant="secondary" onClick={onSelectionChange}>CHESS.3.0</Button>{' '}
                    <Button variant="secondary" onClick={onSelectionChange}>CHESS.3.0.1</Button>{' '}
                    <Button variant="secondary" onClick={onSelectionChange}>CSESS</Button>{' '}
                    <Button variant="secondary" onClick={onSelectionChange}>GENCODE</Button>{' '}
                    <Button variant="secondary" onClick={onSelectionChange}>MANE</Button>{' '}
                    <Button variant="secondary" onClick={onSelectionChange}>RefSeq</Button>{' '}
                    <div>
                        <p>Active selection to exclude: {selection}</p>
                    </div>
                </div>
            </Collapse>

        </div>
        
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

export default SelectDataSource;