import React, { useState } from 'react';
import './SPA.css';
import ButtonPrecompiled from './components/ButtonPrecompiled/ButtonPrecompiled';
import ButtonCustom from './components/ButtonCustom/ButtonCustom';
import SelectOrganism from './components/SelectOrganism/SelectOrganism';
import SelectAssembly from './components/SelectAssembly/SelectAssembly';

const SPA = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [selection_organism, setSelectionOrganism] = useState('');
  const [selection_assembly, setSelectionAssembly] = useState('');
  const [selection_sources, setSelectionSources] = useState('');
  const [selection_types, setSelectionTypes] = useState('');

  const handleNextSlide = () => {
    setSlideIndex(slideIndex + 1);
  };

  const handlePreviousSlide = () => {
    setSlideIndex(slideIndex - 1);
  };

  const handleSelectionOrganismChange = (event) => {
    setSelectionOrganism(event.target.value);
  };

  const handleSelectionAssemblyChange = (event) => {
    setSelectionAssembly(event.target.value);
  };

  const renderSlide = () => {
    switch (slideIndex) {
      case 0:
        return (
          <div className="SPA">
            <h1 className="display-4">CHESS2 Web Interface</h1>
            <p className="lead">CHESS2 is a comprehensive set of human genes based on nearly 10,000 RNA sequencing experiments produced by the GTEx project.</p>
            <hr className="my-4"/>
            <p>You can select through our various references to create a custom annotation!</p>
            <ButtonCustom onClick={handleNextSlide} />
            <ButtonPrecompiled />
          </div>
        );
      case 1:
        return (
          <SelectOrganism
            selection={selection_organism}
            onSelectionChange={handleSelectionOrganismChange}
            onNextSlide={handleNextSlide}
            onPreviousSlide={handlePreviousSlide}
            prop_className="SPA"
          />
        );
      case 2:
        return (
          <SelectAssembly
            selection={selection_assembly}
            onSelectionChange={handleSelectionAssemblyChange}
            onNextSlide={handleNextSlide}
            onPreviousSlide={handlePreviousSlide}
            prop_className="SPA"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="slide-container">
      {renderSlide()}
    </div>
  );
};

export default SPA;