import React from 'react';
import { usePDBDownloading } from '../../redux/hooks';
import { downloadPDBFile } from '../../redux/pdb/pdbThunks';
import PDBViewer from '../PDBViewer';

interface PDBEntryProps {
  entry: any;
  entryIndex: number;
  dataset: any;
  dispatch: any;
}

const PDBEntry: React.FC<PDBEntryProps> = ({ entry, entryIndex, dataset, dispatch }) => {
  const isDownloading = usePDBDownloading(entry.td_id);
  
  const handleDownload = async () => {
    console.log("handleDownload", entry.td_id);
    try {
      await dispatch(downloadPDBFile(entry.td_id)).unwrap();
      // Download started successfully - no need for success message since it's a file download
    } catch (error) {
      console.error('PDB download failed:', error);
      alert(`PDB download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="pdb-entry mb-3">
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
        td_id={entry.td_id}
        width={600}
        height={500}
        title={`${dataset.dataset_name} - ${entry.td_id || `Entry ${entryIndex + 1}`}`}
      />
    </div>
  );
};

export default PDBEntry; 