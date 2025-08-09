import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import {
  createViewState,
  JBrowseLinearGenomeView,
} from '@jbrowse/react-linear-genome-view';
import { Alert, Spinner } from 'react-bootstrap';
import { useAppData, useSelectedOrganism, useSelectedAssembly, useSelectedSource, useSelectedVersion } from '../../hooks/useGlobalData';

import { getDefaultSession, BrowserSessionProps } from './defaultSession';
import { getAssembly, BrowserAssemblyProps } from './assembly';
import { getTracks, BrowserTrackProps } from './tracks';

type ViewModel = ReturnType<typeof createViewState>;

interface BrowserProps {
  accession_id?: string | null;
}

const GenomeBrowser = forwardRef<any, BrowserProps>((_, ref) => {
  const appData = useAppData();
  const organism = useSelectedOrganism();
  const assembly = useSelectedAssembly();
  const source = useSelectedSource();
  const version = useSelectedVersion();
  const [viewState, setViewState] = useState<ViewModel>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organism || !assembly || !source || !version || 
        !appData.selections.organism_id || !appData.selections.assembly_id || 
        !appData.selections.source_id || !appData.selections.version_id || 
        !appData.selections.sva_id || !appData.selections.nomenclature) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the current selections to determine what files to load
      const assemblyProps: BrowserAssemblyProps = {
        name: assembly.assembly_name,
        assembly_name: assembly.assembly_name,
        assembly_id: assembly.assembly_id,
        nomenclature: appData.selections.nomenclature
      };

      const trackProps: BrowserTrackProps = {
        name: `${source.name} - ${version.version_name}`,
        assembly_name: assembly.assembly_name,
        sva_id: appData.selections.sva_id,
        nomenclature: appData.selections.nomenclature
      };

      const sessionProps: BrowserSessionProps = {
        assembly_name: assembly.assembly_name,
        assembly_id: assembly.assembly_id,
        nomenclature: appData.selections.nomenclature
      };

      const assemblyConfig = getAssembly(assemblyProps);
      const tracksConfig = getTracks(trackProps);
      const defaultSession = getDefaultSession(sessionProps);

      const state = createViewState({
        assembly: assemblyConfig,
        tracks: tracksConfig,
        location: 'chr1:23627334-23640566', // Default location - could be made dynamic
        defaultSession,
        onChange: () => {
          // Patch handling can be added here if needed
        },
        configuration: {
          rpc: {
            defaultDriver: 'WebWorkerRpcDriver',
          },
          disableAddTrack: true,   // Disables the menu button for adding tracks
          disableDrawer: true,     // Disables the drawer for more settings
        },
        makeWorkerInstance: () => {
          return new Worker(new URL('./rpcWorker', import.meta.url), {
            type: 'module',
          });
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
  }, [organism, assembly, source, version, appData.selections]);

  useImperativeHandle(ref, () => ({
    getViewState: () => viewState,
  }), [viewState]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading genome browser...</span>
        </Spinner>
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
        <p>Please select an organism and assembly to view the genome browser.</p>
      </Alert>
    );
  }

  return (
    <>
      <JBrowseLinearGenomeView
        viewState={viewState}
      />
    </>
  );
});

export default GenomeBrowser; 