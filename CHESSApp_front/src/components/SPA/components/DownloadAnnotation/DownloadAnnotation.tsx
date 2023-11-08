import { Form } from 'react-bootstrap';
import { ConfigureButton } from './ConfigureButton';
import UTRRanking from './UTRRanking';
import {Button } from 'react-bootstrap';


interface Props {
    onNextSlide: () => void;
    onPreviousSlide: () => void;
    prop_className?: string;
  }
  


export function DownloadAnnotation(props: Props) {
    const {onNextSlide, onPreviousSlide, prop_className } = props;

    // TEST OPTIONS FOR RANKING
    const options = ['MANE', 'RefSeq', 'CHESS'];
    const defaultRanking = ['MANE', 'RefSeq', 'CHESS'];

  return (
    <div className={`${prop_className}`}>
      <div className="row">
        <div className="col-md-6 pr-md-5">

        {/* SELECTING THE OUTPUT FILE TYPE*/}
        <div className="font-weight-bold">Which type(s) of outputs would you like to include?</div>

        <Form>
            <Form.Group>
                <div className="checkbox justify-content-start">
                    <Form.Check type="checkbox" label="Annotation" id="Annotation"/>
                    <ConfigureButton/>
                    <div className='p-2'></div>

                    <Form.Check type="checkbox" label="Genome fasta file" id="Genome fasta file"/>
                    <ConfigureButton/>
                    <div className='p-2'></div>

                    <Form.Check type="checkbox" label="Transcript fasta file" id="Transcript fasta file"/>
                    <ConfigureButton/>
                    <div className='p-2'></div>

                    <Form.Check type="checkbox" label="Protein fasta file" id="Protein fasta file"/>
                    <ConfigureButton/>
                    <div className='p-2'></div>

                </div>
            </Form.Group>
        </Form>
        <div className='p-2'></div>


        {/* SELECTING NOMENCLATURE*/}
        <div className="font-weight-bold">Select the type of nomenclature to be used.</div>
        <div className="form-check">
            <input className="form-check-input" type="radio" name="selection1" value="option1"/>
            <label className="form-check-label">
                Nomenclature Type 1
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="selection1" value="option2"/>
            <label className="form-check-label">
                Nomenclature Type 2
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="selection1" value="option3"/>
            <label className="form-check-label">
                Nomenclature Type 3
            </label>
          </div>
          <div className='p-3'></div>


        {/* SELECT UTR PRIORITIES*/}
        <div className="font-weight-bold">Select the priority list for resolving conflicts between data sources.</div>
        <UTRRanking options={options} defaultRanking={defaultRanking} />
        <div className='p-3'></div>

         {/* DOWNLOAD BUTTON*/}
                  <Button
                      variant="primary"
                      style={{ width: "200px", backgroundColor: "#003f5c", borderColor: "#003f5c" }}
                  >
                      Download
                  </Button>
         <div className='p-3'></div>


        {/* NEXT AND PREVIOUS SLIDE BUTTONS*/}
        <button className="btn btn-primary" onClick={onPreviousSlide}>Previous</button>
        </div>
        
        {/* INFORMATIONAL SLIDE (on the right)*/}
        <div className="col-md-6 pl-md-5 border-left">
          <p>General information goes here</p>
        </div>
      </div>
    </div>
  );
}