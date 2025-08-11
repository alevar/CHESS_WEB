import React, { useState, useMemo } from 'react';
import { useDbData, useAppData } from '../../redux/hooks';
import { Source, SourceVersion, SourceVersionAssembly } from '../../types/dbTypes';
import './TrackManager.css';

export interface TrackConfig {
  trackId: string;
  name: string;
  source_id: number;
  sv_id: number;
  sva_id: number;
  nomenclature: string;
  colorScheme: string;
}

interface TrackManagerProps {
  currentTracks: TrackConfig[];
  onTracksChange: (tracks: TrackConfig[]) => void;
  currentAssembly: number;
  currentNomenclature: string;
}

const TrackManager: React.FC<TrackManagerProps> = ({
  currentTracks,
  onTracksChange,
  currentAssembly,
  currentNomenclature
}) => {
  const { sources } = useDbData();
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);

  // Color schemes for tracks
  const colorSchemes = [
    'Orange/Green/Red',
    'Blue/Light Red/Light Green',
    'Purple/Orange/Teal',
    'Brown/Pink/Gray',
    'Red/Blue/Green',
    'Orange/Purple/Green'
  ];

  // Get sources available for current assembly
  const availableSources = useMemo(() => {
    if (!sources || !currentAssembly) return [];
    
    return Object.values(sources).filter((source: Source) => {
      return source.versions && Object.values(source.versions).some((version: SourceVersion) => {
        return version.assemblies && Object.values(version.assemblies).some((sva: SourceVersionAssembly) => 
          sva.assembly_id === currentAssembly
        );
      });
    });
  }, [sources, currentAssembly]);

  // Get versions for a source available for current assembly
  const getVersionsForSource = (sourceId: number): SourceVersion[] => {
    const source = sources[sourceId];
    if (!source?.versions) return [];
    
    return Object.values(source.versions).filter((version: SourceVersion) => {
      return version.assemblies && Object.values(version.assemblies).some((sva: SourceVersionAssembly) => 
        sva.assembly_id === currentAssembly
      );
    });
  };

  // Check if version is selected as track
  const isVersionSelected = (sourceId: number, svId: number): boolean => {
    return currentTracks.some(track => track.source_id === sourceId && track.sv_id === svId);
  };

  // Add track
  const addTrack = (source: Source, version: SourceVersion): void => {
    const sva = Object.values(version.assemblies || {}).find((sva: SourceVersionAssembly) => 
      sva.assembly_id === currentAssembly
    );

    const newTrack: TrackConfig = {
      trackId: `track-${source.source_id}-${version.sv_id}`,
      name: `${source.name} - ${version.version_name}`,
      source_id: source.source_id,
      sv_id: version.sv_id,
      sva_id: sva?.sva_id || 0,
      nomenclature: currentNomenclature,
      colorScheme: colorSchemes[currentTracks.length % colorSchemes.length]
    };

    onTracksChange([...currentTracks, newTrack]);
  };

  // Remove track
  const removeTrack = (sourceId: number, svId: number): void => {
    onTracksChange(currentTracks.filter(track => 
      !(track.source_id === sourceId && track.sv_id === svId)
    ));
  };

  // Render track action button
  const renderTrackAction = (source: Source, version: SourceVersion) => {
    const isSelected = isVersionSelected(source.source_id, version.sv_id);
    const trackId = `track-${source.source_id}-${version.sv_id}`;
    const isHovered = hoveredTrackId === trackId;

    if (isSelected) {
      return isHovered ? (
        <button
          className="btn btn-sm track-btn track-btn-remove"
          onClick={() => removeTrack(source.source_id, version.sv_id)}
        >
          <i className="bi bi-dash-circle"></i>
        </button>
      ) : (
        <div className="track-btn track-btn-selected">
          <i className="bi bi-check-circle-fill text-success"></i>
        </div>
      );
    }

    return (
      <button
        className="btn btn-sm track-btn track-btn-add"
        onClick={() => addTrack(source, version)}
      >
        <i className="bi bi-plus-circle"></i>
      </button>
    );
  };

  if (availableSources.length === 0) {
    return (
      <div className="track-manager-sidebar">
        <div className="text-muted text-center py-3">
          No sources available for current assembly
        </div>
      </div>
    );
  }

  return (
    <div className="track-manager-sidebar">
      <div className="source-groups">
        {availableSources.map((source: Source) => {
          const versions = getVersionsForSource(source.source_id);
          
          return (
            <div key={source.source_id} className="source-group">
              <div className="source-header">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-medium">{source.name}</span>
                  <i className="bi bi-chevron-down text-muted"></i>
                </div>
                <small className="text-muted">
                  {versions.length} version{versions.length !== 1 ? 's' : ''} available
                </small>
              </div>
              
              <div className="version-list">
                {versions.map((version: SourceVersion) => {
                  const trackId = `track-${source.source_id}-${version.sv_id}`;
                  
                  return (
                    <div 
                      key={version.sv_id} 
                      className="version-item"
                      onMouseEnter={() => setHoveredTrackId(trackId)}
                      onMouseLeave={() => setHoveredTrackId(null)}
                    >
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <span className="version-name">{version.version_name}</span>
                        <div className="track-action">
                          {renderTrackAction(source, version)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrackManager;