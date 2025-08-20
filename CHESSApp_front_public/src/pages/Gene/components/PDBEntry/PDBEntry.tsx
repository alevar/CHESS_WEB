import React, { useState } from 'react';
import { usePDBData } from '../../../../hooks';
import { downloadPDBFile } from '../../../../redux/pdb/pdbThunks';
import PDBViewer from '../PDBViewer';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../redux/store';

interface PDBEntryProps {
  dataset: any;
  bg_color: string;
}

const PDBEntry: React.FC<PDBEntryProps> = ({ dataset, bg_color }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { getPDBData } = usePDBData();
  const pdbData = getPDBData();
  
  // State to track current index for this PDB dataset
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!dataset.data_entries || dataset.data_entries.length === 0) {
    return null;
  }
  
  const currentEntry = dataset.data_entries[currentIndex];
  const isDownloading = pdbData.downloading[currentEntry.td_id];
  
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(dataset.data_entries.length - 1, prev + 1));
  };
  
  const handleDownload = async () => {
    console.log("handleDownload", currentEntry.td_id);
    try {
      await dispatch(downloadPDBFile(currentEntry.td_id)).unwrap();
    } catch (error) {
      console.error('PDB download failed:', error);
      alert(`PDB download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="pdb-entry mb-3">
      {/* Current PDB Entry */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <i className={`bi ${isDownloading ? 'bi-hourglass-split' : 'bi-download'} me-1`}></i>
            {isDownloading ? 'Downloading...' : 'Download PDB'}
          </button>
        </div>
        
        <PDBViewer
          td_id={currentEntry.td_id}
          width={600}
          height={500}
          bg_color={bg_color}
        />
      </div>
      
      {/* Navigation Controls and Counter */}
      <div className="d-flex justify-content-center align-items-center">
        {/* Previous Button */}
        <button
          className="btn btn-outline-secondary me-3"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{ minWidth: '40px' }}
        >
          ←
        </button>
        
        {/* Counter/Indicator */}
        <div className="text-center">
          <small className="text-muted">
            {currentIndex + 1} of {dataset.data_entries.length}
          </small>
        </div>
        
        {/* Next Button */}
        <button
          className="btn btn-outline-secondary ms-3"
          onClick={handleNext}
          disabled={currentIndex === dataset.data_entries.length - 1}
          style={{ minWidth: '40px' }}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default PDBEntry; 