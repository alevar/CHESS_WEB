import { useState } from 'react';
import './SPA.css';
import ButtonPrecompiled from './components/ButtonPrecompiled/ButtonPrecompiled';
import ButtonCustom from './components/ButtonCustom/ButtonCustom';
import SelectOrganism from './components/SelectOrganism/SelectOrganism';
import SelectAssembly from './components/SelectAssembly/SelectAssembly';
import SelectDataSource from './components/SelectDataSource/SelectDataSource';
import { DownloadAnnotation } from './components/DownloadAnnotation/DownloadAnnotation';

const SPA = () => {
// STATE HOOKS
  const [slideIndex, setSlideIndex] = useState(0);
  const [selection_organism, setSelectionOrganism] = useState<string>('');
  const [selection_assembly, setSelectionAssembly] = useState<string>('');

  const [selection_sources, setSelectionSources] = useState<string[]>([]);
  const [exclusion_sources, setExclusionSources] = useState<string[]>([]);

  const [gene_types, setGeneTypes] = useState<string[]>([]);
  const [transcript_types, setTranscriptTypes] = useState<string[]>([]);
  const [selected_scaffolds, setScaffolds] = useState<string[]>([]);



// DEFINING STATE FUNCTIONS
  const handleNextSlide = () => {
    setSlideIndex(slideIndex + 1);
  };

  const handlePreviousSlide = () => {
    setSlideIndex(slideIndex - 1);
  };

  const handleSelectionOrganismChange = (event: any) => {
    setSelectionOrganism(event.target.value);
  };

  const handleSelectionAssemblyChange = (event: any) => {
    setSelectionAssembly(event.target.value);
  };

  const handleSelectionDataSourceChange = (event: any) => {
    const selectedValue = event.target.textContent;
    if (selection_sources.includes(selectedValue)) {
      const updatedSelectionSources = selection_sources.filter(item => item !== selectedValue);
      setSelectionSources(updatedSelectionSources);
    } else {
      const newSelectionSources = [...selection_sources, selectedValue];
      setSelectionSources(newSelectionSources);
    }
  }
  
  const handleExclusionDataSourceChange = (event: any) => {
    const excludedValue = event.target.textContent;
    if (exclusion_sources.includes(excludedValue)) {
      const updatedExclusionSources = exclusion_sources.filter(item => item !== excludedValue);
      setExclusionSources(updatedExclusionSources);
    } else {
      const newExclusionSources = [...exclusion_sources, excludedValue];
      setExclusionSources(newExclusionSources);
    }
  }
  
  const handleGeneTypeChange = (event: any) => {
    const gt = event.target.id;
    if (gene_types.includes(gt)) {
      const updatedGT = gene_types.filter(item => item !== gt);
      setGeneTypes(updatedGT);
    } else {
      const newExclusionSources = [...gene_types, gt];
      setGeneTypes(newExclusionSources);
    }
  }

  const handleTranscriptTypeChange = (event: any) => {
    const tt = event.target.id;
    if (transcript_types.includes(tt)) {
      const updatedTT = transcript_types.filter(item => item !== tt);
      setTranscriptTypes(updatedTT);
    } else {
      const newExclusionSources = [...transcript_types, tt];
      setTranscriptTypes(newExclusionSources);
    }
  }

  const handleScaffoldTypeChange = (event: any) => {
    const scaffold = event.target.value;
    if (selected_scaffolds.includes(scaffold)) {
      const updatedScaffolds = selected_scaffolds.filter(item => item !== scaffold);
      setScaffolds(updatedScaffolds);
    } else {
      const updatedScaffolds = [...selected_scaffolds, scaffold];
      setScaffolds(updatedScaffolds);
    }
  }


// RENDERING THE UI
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
        case 3:
          return (
            <SelectDataSource
              selection={selection_sources}
              exclusion={exclusion_sources}
              gene_types={gene_types}
              transcript_types={transcript_types}
              selected_scaffolds={selected_scaffolds}

              onSelectionChange={handleSelectionDataSourceChange}
              onExclusionChange={handleExclusionDataSourceChange}
              onGeneTypeChange={handleGeneTypeChange}
              onTranscriptTypeChange={handleTranscriptTypeChange}
              setScaffolds={handleScaffoldTypeChange}

              onNextSlide={handleNextSlide}
              onPreviousSlide={handlePreviousSlide}
              prop_className="SPA"
            />
          );
          case 4:
            return (
              <DownloadAnnotation
              onNextSlide={handleNextSlide}
              onPreviousSlide={handlePreviousSlide}
              prop_className="SPA"/>
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