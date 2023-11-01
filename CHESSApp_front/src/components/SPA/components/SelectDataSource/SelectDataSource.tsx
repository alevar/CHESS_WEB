import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';


interface Props {
  selection: string;
  exclusion: string;
  onSelectionChange: (event: any) => void;
  onExclusionChange: (event: any) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  prop_className?: string;
}

function SelectDataSource(props: Props) {
  const { selection, exclusion, onSelectionChange, onExclusionChange, onNextSlide, onPreviousSlide, prop_className } = props;
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleSelection = (selected: string) => {
    onSelectionChange(selected);
  };


  return (
    <div className={`${prop_className}`}>
      <div className="row">
        <div className="col-md-6 pr-md-5">
            <ToggleButtonGroup type="checkbox">
                <ToggleButton variant="secondary" id="chess3" value="CHESS.3.0" onClick={onSelectionChange}>CHESS.3.0</ToggleButton>
                <ToggleButton variant="secondary" id="chess301" value="CHESS.3.0.1" onClick={onSelectionChange}>CHESS.3.0.1</ToggleButton>
                <ToggleButton variant="secondary" id="csess" value="CSESS" onClick={onSelectionChange}>CSESS</ToggleButton>
                <ToggleButton variant="secondary" id="gencode" value="GENCODE" onClick={onSelectionChange}>GENCODE</ToggleButton>
                <ToggleButton variant="secondary" id="mane" value="MANE" onClick={onSelectionChange}>MANE</ToggleButton>
                <ToggleButton variant="secondary" id="refseq" value="RefSeq" onClick={onSelectionChange}>RefSeq</ToggleButton>
            </ToggleButtonGroup>

          <p>Active selection: {selection}</p>
 
        <div className='p-4'>
            <Button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                aria-expanded={showAdvancedOptions}
                className="btn-sm btn-warning">
                Advanced Options
            </Button>

            <Collapse in={showAdvancedOptions}>
                <div>
                    <ToggleButtonGroup type="checkbox">
                        <ToggleButton variant="secondary" id="chess3_excl" value="CHESS.3.0" onClick={onExclusionChange}>CHESS.3.0</ToggleButton>
                        <ToggleButton variant="secondary" id="chess301_excl" value="CHESS.3.0.1" onClick={onExclusionChange}>CHESS.3.0.1</ToggleButton>
                        <ToggleButton variant="secondary" id="csess_excl" value="CSESS" onClick={onExclusionChange}>CSESS</ToggleButton>
                        <ToggleButton variant="secondary" id="gencode_excl" value="GENCODE" onClick={onExclusionChange}>GENCODE</ToggleButton>
                        <ToggleButton variant="secondary" id="mane_excl" value="MANE" onClick={onExclusionChange}>MANE</ToggleButton>
                        <ToggleButton variant="secondary" id="refseq_excl" value="RefSeq" onClick={onExclusionChange}>RefSeq</ToggleButton>
                    </ToggleButtonGroup>
                    <div>
                        <p>Active selection to exclude: {exclusion}</p>
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