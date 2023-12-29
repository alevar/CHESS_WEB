import React, { useState } from 'react';
import './Custom.css';
import SelectSource from './components/SourceSelection/SourceSelection';
import SelectGenes from './components/GeneSelection/GeneSelection';
import SelectTranscripts from './components/TranscriptSelection/TranscriptSelection';

import { useGetTxSummarySliceQuery } from '../../features/database/databaseApi';

const Custom = () => {

  const { txdata, txerror, txisLoading } = useGetTxSummarySliceQuery({"queryParams": "val"});

  const [slideIndex, setSlideIndex] = useState(0);
  const [selection_sources, setSelectionSources] = useState({});
  const [selection_genes, setSelectionGenes] = useState('');
  const [selection_transcripts, setSelectionTranscripts] = useState('');

  const handleNextSlide = () => {
    setSlideIndex(slideIndex + 1);
  };

  const handlePreviousSlide = () => {
    setSlideIndex(slideIndex - 1);
  };

  const handleSelectionSourceChange = (event) => {
    setSelectionSources(event.target.value);
  };

  const handleSelectionGenesChange = (event) => {
    setSelectionGenes(event.target.value);
  };

  const handleSelectionTranscriptsChange = (event) => {
    setSelectionTranscripts(event.target.value);
  };

  const renderSlide = () => {
    switch (slideIndex) {
      case 0:
        return (
          <SelectSource
            selection={selection_sources}
            onSelectionChange={handleSelectionSourceChange}
            onNextSlide={handleNextSlide}
            onPreviousSlide={handlePreviousSlide}
            prop_className="SelectSource"
          />
        );
      case 1:
        return (
          <SelectGenes
            selection={selection_genes}
            onSelectionChange={handleSelectionGenesChange}
            onNextSlide={handleNextSlide}
            onPreviousSlide={handlePreviousSlide}
            prop_className="SelectGenes"
          />
        );
      case 2:
        return (
          <SelectTranscripts
            selection={selection_transcripts}
            onSelectionChange={handleSelectionTranscriptsChange}
            onNextSlide={handleNextSlide}
            onPreviousSlide={handlePreviousSlide}
            prop_className="SelectTranscripts"
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

export default Custom;