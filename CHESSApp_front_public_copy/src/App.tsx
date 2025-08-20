import React, { useEffect } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDbData } from './redux/dbData/dbDataThunks';
import { initializeAppSelections } from './redux/appData/appDataThunks';
import { RootState, AppDispatch } from './redux/store';
import { useAppData } from './redux/hooks';

import { PathParts, parsePathname, buildPathname } from './utils/utils';
import { Source, Assembly, SourceVersion } from './types/dbTypes';

import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';

const App: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { lastUpdated: dbDataLastUpdated, ...dbData } = useSelector((state: RootState) => state.dbData);
  const { initialized } = useSelector((state: RootState) => state.appData);
  const appData = useAppData();
  const location = useLocation();
  const pathParts: PathParts = parsePathname(location.pathname);

  const { organism, assembly } = useParams<{
    organism: string;
    assembly: string;
  }>();

  // Helper function to get active configuration defaults
  const getActiveConfigurationDefaults = () => {
    const activeConfig = Object.values(dbData.configurations || {}).find(config => config.active);
    
    if (activeConfig) {
      return {
        organism_id: activeConfig.organism_id,
        assembly_id: activeConfig.assembly_id,
        source_id: activeConfig.source_id,
        version_id: activeConfig.sv_id,
        nomenclature: activeConfig.nomenclature
      };
    }
    
    // Fallback to hardcoded defaults if no active configuration found
    return {
      organism_id: 1,
      assembly_id: 1,
      source_id: null,
      version_id: null,
      nomenclature: null
    };
  };

  // Get default values from active configuration
  const defaults = getActiveConfigurationDefaults();

  // No longer needed - organism/assembly parsing moved to individual components

  // Parse all URL parameters
  const organism_id = organism ? Number(organism.split(':')[1]) : null;
  const assembly_id = assembly ? Number(assembly.split(':')[1]) : null;
  
  // Parse additional parameters from URL
  const urlParams = parsePathname(location.pathname).params;
  const source_id = urlParams.sid ? Number(urlParams.sid) : null;
  const version_id = urlParams.vid ? Number(urlParams.vid) : null;
  const nomenclature = urlParams.nom || null;

  useEffect(() => {
    // Fetch database data if not already fetched
    if (!dbDataLastUpdated) {
      dispatch(fetchDbData());
    }
  }, [dispatch, dbDataLastUpdated]);

  // URL Validation and redirection logic
  useEffect(() => {
    // Wait for database data to be loaded before validating
    if (!dbDataLastUpdated) return;

    // Check if basic organism/assembly are missing
    if (!organism || !assembly) {
      const params: Record<string, string> = { 
        oid: defaults.organism_id.toString(), 
        aid: defaults.assembly_id.toString() 
      };
      if (defaults.source_id) params.sid = defaults.source_id.toString();
      if (defaults.version_id) params.vid = defaults.version_id.toString();
      if (defaults.nomenclature) params.nom = defaults.nomenclature;
      
      const new_path = buildPathname({ params, remainder: pathParts.remainder });
      navigate(new_path, { replace: true });
      return;
    }

    // Validate organism and assembly IDs
    if (!organism_id || !assembly_id || isNaN(organism_id) || isNaN(assembly_id)) {
      const params: Record<string, string> = { 
        oid: defaults.organism_id.toString(), 
        aid: defaults.assembly_id.toString() 
      };
      if (defaults.source_id) params.sid = defaults.source_id.toString();
      if (defaults.version_id) params.vid = defaults.version_id.toString();
      if (defaults.nomenclature) params.nom = defaults.nomenclature;
      
      const new_path = buildPathname({ params, remainder: pathParts.remainder });
      navigate(new_path, { replace: true });
      return;
    }

    // Get database data for validation
    const { sources, assemblies, organisms } = dbData;
    const organismData = organisms[organism_id];
    const assemblyData = assemblies[assembly_id];

    // Validate organism exists
    if (!organismData) {
      const params: Record<string, string> = { 
        oid: defaults.organism_id.toString(), 
        aid: defaults.assembly_id.toString() 
      };
      if (defaults.source_id) params.sid = defaults.source_id.toString();
      if (defaults.version_id) params.vid = defaults.version_id.toString();
      if (defaults.nomenclature) params.nom = defaults.nomenclature;
      
      const new_path = buildPathname({ params, remainder: pathParts.remainder });
      navigate(new_path, { replace: true });
      return;
    }

    // Validate assembly exists and belongs to organism
    if (!assemblyData || assemblyData.taxonomy_id !== organism_id) {
      // Find first valid assembly for this organism
      const validAssembly = Object.values(assemblies).find(asm => asm.taxonomy_id === organism_id);
      const validAssemblyId = validAssembly ? validAssembly.assembly_id : defaults.assembly_id;
      
      const new_path = buildPathname({ 
        params: { oid: organism_id.toString(), aid: validAssemblyId.toString() }, 
        remainder: pathParts.remainder 
      });
      navigate(new_path, { replace: true });
      return;
    }

    // Validate nomenclature if provided
    if (nomenclature && (!assemblyData.nomenclatures || !assemblyData.nomenclatures.includes(nomenclature))) {
      // Remove invalid nomenclature from URL
      const validParams: Record<string, string> = { 
        oid: organism_id.toString(), 
        aid: assembly_id.toString() 
      };
      if (source_id) validParams.sid = source_id.toString();
      if (version_id) validParams.vid = version_id.toString();
      
      const new_path = buildPathname({ params: validParams, remainder: pathParts.remainder });
      navigate(new_path, { replace: true });
      return;
    }

    // Validate source if provided
    if (source_id && (!sources[source_id] || !validateSourceAssemblyCompatibility(sources[source_id], assemblyData))) {
      // Remove invalid source and version from URL
      const validParams: Record<string, string> = { 
        oid: organism_id.toString(), 
        aid: assembly_id.toString() 
      };
      if (nomenclature) validParams.nom = nomenclature;
      
      const new_path = buildPathname({ params: validParams, remainder: pathParts.remainder });
      navigate(new_path, { replace: true });
      return;
    }

    // Validate version if provided
    if (version_id && source_id) {
      const sourceData = sources[source_id];
      if (!sourceData?.versions?.[version_id] || !validateVersionAssemblyCompatibility(sourceData.versions[version_id], assemblyData)) {
        // Remove invalid version from URL
        const validParams: Record<string, string> = { 
          oid: organism_id.toString(), 
          aid: assembly_id.toString(),
          sid: source_id.toString()
        };
        if (nomenclature) validParams.nom = nomenclature;
        
        const new_path = buildPathname({ params: validParams, remainder: pathParts.remainder });
        navigate(new_path, { replace: true });
        return;
      }
    }

    // All validations passed - initialize or update app selections
    const currentSelections = appData.selections;
    const needsUpdate = !initialized || 
      currentSelections.organism_id !== organism_id ||
      currentSelections.assembly_id !== assembly_id ||
      currentSelections.source_id !== source_id ||
      currentSelections.version_id !== version_id ||
      currentSelections.nomenclature !== nomenclature;

    if (needsUpdate) {
      dispatch(initializeAppSelections({ 
        organism_id, 
        assembly_id,
        source_id: source_id || undefined,
        version_id: version_id || undefined,
        nomenclature: nomenclature || undefined
      }));
    }
  }, [dispatch, organism, assembly, organism_id, assembly_id, source_id, version_id, nomenclature, navigate, pathParts.remainder, dbDataLastUpdated, initialized, dbData, defaults, appData.selections]);

  // Helper function to validate source-assembly compatibility
  const validateSourceAssemblyCompatibility = (source: Source, assembly: Assembly): boolean => {
    if (!source.versions) return false;
    
    // Check if any version of this source has an assembly entry for our assembly
    return Object.values(source.versions).some((version: SourceVersion) => {
      if (!version.assemblies) return false;
      return Object.values(version.assemblies).some(sva => sva.assembly_id === assembly.assembly_id);
    });
  };

  // Helper function to validate version-assembly compatibility
  const validateVersionAssemblyCompatibility = (version: SourceVersion, assembly: Assembly): boolean => {
    if (!version.assemblies) return false;
    return Object.values(version.assemblies).some(sva => sva.assembly_id === assembly.assembly_id);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet /> {/* Render matched child route */}
      </main>
      <Footer />
    </div>
  );
};

export default App;
