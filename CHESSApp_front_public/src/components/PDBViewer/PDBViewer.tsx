import React, { useEffect, useRef, useState } from 'react';
import * as $3Dmol from '3dmol';
import { usePDBByTdId } from '../../redux/hooks';
import { useAppDispatch } from '../../redux/hooks';
import { fetchPDBByTdId } from '../../redux/pdb';
import './PDBViewer.css';

interface PDBViewerProps {
  td_id: number; // Transcript data ID to fetch PDB for
  width?: number;
  height?: number;
  title?: string;
  autoFetch?: boolean; // Whether to automatically fetch PDB data
}

const PDBViewer: React.FC<PDBViewerProps> = ({ 
  td_id, 
  width = 400, 
  height = 400, 
  title = "Protein Structure",
  autoFetch = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [surfaceEnabled, setSurfaceEnabled] = useState(false);
  const dispatch = useAppDispatch();
  
  // Get PDB data from Redux state
  const { data: pdbData, loading, error } = usePDBByTdId(td_id);

  // Fetch PDB data when component mounts
  useEffect(() => {
    if (autoFetch && !pdbData && !loading) {
      dispatch(fetchPDBByTdId(td_id));
    }
  }, [autoFetch, td_id, pdbData, dispatch]);

  useEffect(() => {
    if (!containerRef.current || !pdbData?.pdb_content) return;

    try {
      // Clear previous viewer
      if (viewer) {
        viewer.clear();
        setViewer(null);
      }

      // Create new viewer with black background
      const newViewer = $3Dmol.createViewer(containerRef.current, {});

      // Set viewer dimensions
      newViewer.resize();

      // Load PDB data
      newViewer.addModel(pdbData.pdb_content, "pdb");
      
      // Style the protein with pLDDT coloring using built-in B-factor colorscheme
      newViewer.setStyle({}, {
        cartoon: {
          colorscheme: {
            prop: 'b',
            gradient: 'rwb',
            min: 20,
            max: 100
          }
        }
      });
      
      // Center and zoom the view
      newViewer.zoomTo();
      newViewer.render();

      setViewer(newViewer);

    } catch (err) {
      console.error('Error loading PDB data:', err);
    }

    // Cleanup function
    return () => {
      if (viewer) {
        viewer.clear();
        setViewer(null);
      }
    };
  }, [pdbData?.pdb_content, width, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (viewer && containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        viewer.resize(newWidth, newHeight);
        viewer.render();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewer]);

  if (error) {
    return (
      <div className="pdb-viewer-error">
        <div className="error-content">
          <i className="bi bi-exclamation-triangle text-warning"></i>
          <p className="text-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdb-viewer">
      
      <div className="pdb-viewer-container">
        {loading && (
          <div className="pdb-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading protein structure...</p>
          </div>
        )}
        
        <div 
          ref={containerRef} 
          className="pdb-3d-container"
          style={{ 
            width: '100%', 
            height: height,
            backgroundColor: 'black'
          }}
        />
      </div>
      
      <div className="pdb-info">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Use mouse to rotate, scroll to zoom, right-click to pan
        </small>
      </div>
    </div>
  );
};

export default PDBViewer;