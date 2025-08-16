import React, { useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'react-bootstrap';

import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import { AppSettingsModal } from './components/modals/AppSettingsModal';

import { RootState, AppDispatch } from './redux/store';
import { fetchDbData, selectActiveConfigurationDefaults } from './redux/dbData';
import { setAppSelections, setError } from './redux/appData/appDataSlice';
import { validateSelections } from './utils/validationUtils';
import { UrlParams, AppSettings } from './types/appTypes';
import { pathManager } from './utils/pathManager';

import './App.css';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<UrlParams>();

  const dbData = useSelector((state: RootState) => state.dbData);
  const appData = useSelector((state: RootState) => state.appData);
  
  const defaultConfig = useSelector((state: RootState) =>
    selectActiveConfigurationDefaults(state.dbData)
  );

  // Fetch database data on mount
  useEffect(() => {
    dispatch(fetchDbData());
  }, [dispatch]);

  // Handle app initialization when data is loaded
  useEffect(() => {
    if (!dbData.loading && !dbData.error && dbData.organisms && Object.keys(dbData.organisms).length > 0) {
      initializeApp();
    }
  }, [dbData.loading, params]);

  const initializeApp = () => {
    try {
      // Check if we have a valid structured app path
      if (pathManager.isStructuredAppPath(location.pathname)) {
        const parsedPath = pathManager.parseStructuredPath(location.pathname);
        console.log('parsedPath', parsedPath);
        if (parsedPath) {
          const urlSelections = {
            organism_id: Number(parsedPath.params.organism),
            assembly_id: Number(parsedPath.params.assembly),
            source_id: Number(parsedPath.params.source),
            version_id: Number(parsedPath.params.version),
            nomenclature: parsedPath.params.nomenclature!,
          };
          
          dispatch(setAppSelections({ selections: urlSelections, dbData }));
          return;
        }
      }

      // Check for incomplete structured parameters (partial app path)
      if (pathManager.isStructuredAppPath(location.pathname)) {
        dispatch(setError('Incomplete URL parameters. All parameters (organism, assembly, source, version, nomenclature) are required.'));
        return;
      }

      // No URL parameters provided - use default configuration
      if (defaultConfig) {
        const configSelections = {
          organism_id: defaultConfig.organism_id!,
          assembly_id: defaultConfig.assembly_id!,
          source_id: defaultConfig.source_id!,
          version_id: defaultConfig.sv_id!,
          nomenclature: defaultConfig.nomenclature!,
        };
        
        if (validateSelections(configSelections, dbData)) {
          // Navigate to the URL that reflects the default configuration
          const defaultUrl = `/o:${defaultConfig.organism_id}/a:${defaultConfig.assembly_id}/s:${defaultConfig.source_id}/v:${defaultConfig.sv_id}/n:${defaultConfig.nomenclature}`;
          navigate(defaultUrl, { replace: true });
          return;
        } else {
          // Default configuration is invalid
          dispatch(setError('Default configuration is invalid. Please contact administrator.'));
          return;
        }
      }
      
      dispatch(setError('No valid configuration found. Please contact administrator.'));
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to initialize application'));
    }
  };

  if (dbData.loading) {
    return <LoadingSpinner />;
  }
  
  if (dbData.error) {
    return <ErrorBoundary error={dbData.error} />;
  }

  if (appData.error) {
    return <AppSettingsModal show={true} canClose={false} />;
  }
  
  if (!appData.initialized) {
    return <LoadingSpinner />;
  }

  return (
    <Container fluid>
      <Header />
      <Outlet />
      <Footer />
    </Container>
  );
};

export default App;