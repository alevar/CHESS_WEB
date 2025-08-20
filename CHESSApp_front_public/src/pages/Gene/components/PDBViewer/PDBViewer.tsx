import React, { useEffect, useRef, useState } from 'react';
import * as $3Dmol from '3dmol';
import { usePDBData } from '../../../../hooks';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../redux/store';
import { fetchPDBByTdId } from '../../../../redux/pdb';
import './PDBViewer.css';

interface PDBViewerProps {
  td_id: number;
  width?: number;
  height?: number;
  bg_color: string;
}

const PDBViewer: React.FC<PDBViewerProps> = ({ 
  td_id, 
  width = 400, 
  height = 400,
  bg_color
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  
  // Get PDB data from Redux state
  const { getPDBData } = usePDBData();
  const pdbData = getPDBData();
  const isDownloading = pdbData.downloading[td_id];

  // Fetch PDB data when component mounts
  useEffect(() => {
    if (!pdbData.pdbData[td_id] && !isDownloading) {
      dispatch(fetchPDBByTdId(td_id));
    }
  }, [td_id, pdbData.pdbData[td_id], isDownloading, dispatch]);

  useEffect(() => {
    if (!containerRef.current || !pdbData.pdbData[td_id]?.pdb_content) {
      return;
    }

    try {
      if (viewer) {
        viewer.clear();
        setViewer(null);
      }

      const newViewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: bg_color
      });
      
      newViewer.addModel(pdbData.pdbData[td_id].pdb_content, "pdb");
      
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
      
      newViewer.zoomTo();
      newViewer.render();

      setViewer(newViewer);

    } catch (err) {
      console.error('Error loading PDB data:', err);
    }

    return () => {
      if (viewer) {
        viewer.clear();
        setViewer(null);
      }
    };
  }, [pdbData.pdbData[td_id]?.pdb_content, width, height]);

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

  if (pdbData.error[td_id]) {
    return (
      <div className="pdb-viewer-error">
        <div className="error-content">
          <i className="bi bi-exclamation-triangle text-warning"></i>
          <p className="text-muted">{pdbData.error[td_id]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdb-viewer">
      <div className="pdb-viewer-container">
        {pdbData.loading[td_id] && (
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
            backgroundColor: '#f8f9fa'
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