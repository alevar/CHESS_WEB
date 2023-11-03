import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { Row, Col, Form } from 'react-bootstrap';
import { Scaffolds } from './Scaffolds';



interface Props {
  selection: string[];
  exclusion: string[];
  onSelectionChange: (event: any) => void;
  onExclusionChange: (event: any) => void;
  onNextSlide: () => void;
  onPreviousSlide: () => void;
  prop_className?: string;
}

function SelectDataSource(props: Props) {
  const { selection, exclusion, onSelectionChange, onExclusionChange, onNextSlide, onPreviousSlide, prop_className } = props;
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);


  return (
    <div className={`${prop_className}`}>
      <div className="row">
        <div className="col-md-6 pr-md-5">

            {/* SELECTING A DATA SOURCE*/}
            <div className="font-weight-bold">1. Select data source(s) for your custom annotation.</div>
            <ToggleButtonGroup type="checkbox">
                <ToggleButton variant="secondary" id="chess3" value="CHESS.3.0" onClick={onSelectionChange}>CHESS.3.0</ToggleButton>
                <ToggleButton variant="secondary" id="chess301" value="CHESS.3.0.1" onClick={onSelectionChange}>CHESS.3.0.1</ToggleButton>
                <ToggleButton variant="secondary" id="csess" value="CSESS" onClick={onSelectionChange}>CSESS</ToggleButton>
                <ToggleButton variant="secondary" id="gencode" value="GENCODE" onClick={onSelectionChange}>GENCODE</ToggleButton>
                <ToggleButton variant="secondary" id="mane" value="MANE" onClick={onSelectionChange}>MANE</ToggleButton>
                <ToggleButton variant="secondary" id="refseq" value="RefSeq" onClick={onSelectionChange}>RefSeq</ToggleButton>
            </ToggleButtonGroup>

            <p className="font-italic">Active selection: {selection.length > 0 ? selection.join(", ") : "None"}</p> 
            <div className='p-2'></div>


            {/* SELECTING A GENE TYPE*/}
            <Form>
                <Form.Group>
                    <Form.Label className="font-weight-bold">3. Select a gene type(s).</Form.Label>
                    <div className="checkbox">
                        <Form.Check type="checkbox" label="Protein-coding" />
                        <Form.Check type="checkbox" label="lncRNA" />
                        <Form.Check type="checkbox" label="Pseudogene" />
                        <Form.Check type="checkbox" label="Other" />
                    </div>
                </Form.Group>
            </Form>
            
            <div className='p-3'></div>

            {/* SELECTING A TRANSCRIPT TYPE*/}
            <Form>
                <Form.Group>
                    <Form.Label className="font-weight-bold">2. Select a gene type(s).</Form.Label>
                    <div className="checkbox">
                        <Form.Check type="checkbox" label="Protein-coding" />
                        <Form.Check type="checkbox" label="lncRNA" />
                        <Form.Check type="checkbox" label="Pseudogene" />
                        <Form.Check type="checkbox" label="Other" />
                    </div>
                </Form.Group>
            </Form>

            <div className='p-2'></div>

            {/* SELECTING SCAFFOLDS*/}
            <div className="font-weight-bold">4. Select scaffold(s).</div>
            <Scaffolds/>
           

        {/* ADVANCED OPTIONS*/}
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
                        <p className="font-italic">Active selection to exclude: {exclusion.length > 0 ? exclusion.join(", ") : "None"}</p>
                    </div>
                </div>
            </Collapse>
        </div>

        {/* NEXT AND PREVIOUS SLIDE BUTTONS*/}
          <button className="btn btn-primary" onClick={onPreviousSlide}>Previous</button>
          <button className="btn btn-primary" onClick={onNextSlide}>Next</button>
        </div>
        
        {/* INFORMATIONAL SLIDE (on the right)*/}
        <div className="col-md-6 pl-md-5 border-left">
          <p>General information goes here</p>
        </div>
      </div>
    </div>
  );
}

export default SelectDataSource;