import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import {
  createViewState,
  JBrowseLinearGenomeView,
} from '@jbrowse/react-linear-genome-view';
import { useSelector } from 'react-redux';
import { Alert, Spinner } from 'react-bootstrap';
import { RootState } from '../../redux/rootReducer';

import { getDefaultSession } from './defaultSession';
import { getAssembly } from './assembly';
import { getTracks } from './tracks';

type ViewModel = ReturnType<typeof createViewState>;

interface BrowserProps {
  accession_id?: string | null;
}

const GenomeBrowser = forwardRef<any, BrowserProps>((props, ref) => {
  const accession_id = 'K03455.1';
  const [viewState, setViewState] = useState<ViewModel>();
  const [patches, setPatches] = useState('');

  useEffect(() => {
    if (!accession_id) {
      return;
    }

    const assembly = getAssembly(accession_id);
    const tracks = getTracks(accession_id);
    const defaultSession = getDefaultSession(accession_id);

    const state = createViewState({
      assembly,
      tracks,
      location: 'chr1:23627334-23640566',
      defaultSession,
      onChange: patch => {
        setPatches(previous => previous + JSON.stringify(patch) + '\n');
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
  }, [accession_id]);

  useImperativeHandle(ref, () => ({
    getViewState: () => viewState,
  }), [viewState]);

  if (!viewState) {
    return null;
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