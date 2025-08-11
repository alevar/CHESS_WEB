import React, { forwardRef, useEffect, useState, useRef } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { JBrowseLinearGenomeView } from '@jbrowse/react-linear-genome-view';
import { createViewState } from '@jbrowse/react-linear-genome-view';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { useSelectedOrganism, useSelectedAssembly, useSelectedSource, useSelectedVersion, useAppData } from '../../redux/hooks';
import { getAssembly, type BrowserAssemblyProps } from './assembly';
import { generateTracksFromConfig, type TrackConfig } from './tracks';
import { generateSessionWithTracks, type BrowserSessionProps } from './defaultSession';

interface BrowserProps {
  currentTracks: TrackConfig[];
  onTracksChange: (tracks: TrackConfig[]) => void;
  initialLocation?: string;
}

const GenomeBrowser = forwardRef<any, BrowserProps>(({ currentTracks, onTracksChange, initialLocation }, ref) => {
  const organism = useSelectedOrganism();
  const assembly = useSelectedAssembly();
  const source = useSelectedSource();
  const version = useSelectedVersion();
  const appData = useAppData();
  
  const [viewState, setViewState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedLocation, setSavedLocation] = useState<string | null>(initialLocation || null);

  // Keep track of previous selections to detect changes
  const previousSelections = useRef<typeof appData.selections | null>(null);

  // Save initialLocation when it changes
  useEffect(() => {
    if (initialLocation) {
      setSavedLocation(initialLocation);
    }
  }, [initialLocation]);

  // Effect to handle appData changes and reset tracks
  useEffect(() => {
    console.log('appData.selections in GenomeBrowser', appData.selections);
    
    if (!organism || !assembly || !source || !version || 
        !appData.selections.organism_id || !appData.selections.assembly_id || 
        !appData.selections.source_id || !appData.selections.version_id || 
        !appData.selections.sva_id || !appData.selections.nomenclature) {
      return;
    }

    // Check if the key selections have changed (which would require track reset)
    const currentSelections = {
      organism_id: appData.selections.organism_id,
      assembly_id: appData.selections.assembly_id,
      source_id: appData.selections.source_id,
      version_id: appData.selections.version_id,
      sva_id: appData.selections.sva_id,
      nomenclature: appData.selections.nomenclature
    };

    const selectionsChanged = !previousSelections.current || 
      JSON.stringify(previousSelections.current) !== JSON.stringify(currentSelections);

    if (selectionsChanged) {
      console.log('Selections changed, resetting tracks');
      previousSelections.current = currentSelections;
      
      // Reset tracks when selections change
      const defaultTrack: TrackConfig = {
        trackId: `track-${source.source_id}-${version.sv_id}`,
        name: `${source.name} - ${version.version_name}`,
        source_id: source.source_id,
        sv_id: version.sv_id,
        sva_id: appData.selections.sva_id,
        nomenclature: appData.selections.nomenclature,
        colorScheme: 'Orange/Green/Red'
      };
      
      onTracksChange([defaultTrack]);
      return; // Exit early, let the next effect run with the new tracks
    }

    // If selections haven't changed, proceed with current tracks
    initializeBrowser();
  }, [organism, assembly, source, version, appData.selections]);

  // Separate effect for browser initialization when tracks change
  useEffect(() => {
    if (!organism || !assembly || !source || !version || 
        !appData.selections.organism_id || !appData.selections.assembly_id || 
        !appData.selections.source_id || !appData.selections.version_id || 
        !appData.selections.sva_id || !appData.selections.nomenclature) {
      return;
    }

    if (currentTracks.length === 0) {
      return; // Wait for tracks to be set
    }

    initializeBrowser();
  }, [currentTracks]);

  const initializeBrowser = () => {
    setLoading(true);
    setError(null);

    try {
      const assemblyProps: BrowserAssemblyProps = {
        name: assembly.assembly_name,
        assembly_name: assembly.assembly_name,
        assembly_id: assembly.assembly_id,
        nomenclature: appData.selections.nomenclature
      };

      const sessionProps: BrowserSessionProps = {
        assembly_name: assembly.assembly_name,
        assembly_id: appData.selections.assembly_id,
        nomenclature: appData.selections.nomenclature
      };

      const tracksConfig = generateTracksFromConfig(currentTracks, assembly.assembly_name);
      const defaultSession = generateSessionWithTracks(sessionProps, tracksConfig.map(track => track.trackId));

      const state = createViewState({
        assembly: getAssembly(assemblyProps),
        tracks: tracksConfig,
        location: savedLocation || 'chr21:23806702-23882645',
        defaultSession,
        onChange: () => {},
        configuration: {
          theme: {
            palette: {
              primary: {
                main: '#1976d2',
              },
              secondary: {
                main: '#dc004e',
              },
            },
          },
        },
        makeWorkerInstance: () => {
          return new Worker(
            new URL('@jbrowse/plugin-linear-genome-view/dist/LinearGenomeView.worker.js', import.meta.url),
            { type: 'module' }
          );
        },
        hydrateFn: hydrateRoot,
        createRootFn: createRoot,
      });

      setViewState(state);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load genome browser');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Genome Browser</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!viewState) {
    return (
      <Alert variant="info">
        <Alert.Heading>No Data Available</Alert.Heading>
        <p>Please select an organism, assembly, source, and version to view the genome browser.</p>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <i className="fas fa-dna me-2"></i>
          Genome Browser
        </h5>
        <small className="text-muted">
          {currentTracks.length} track{currentTracks.length !== 1 ? 's' : ''} loaded
        </small>
      </div>

      <div 
        className="genome-browser-container"
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #dee2e6',
          borderRadius: '0.375rem',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa'
        }}
      >
        <JBrowseLinearGenomeView
          viewState={viewState}
        />
      </div>
    </div>
  );
});

export default GenomeBrowser;