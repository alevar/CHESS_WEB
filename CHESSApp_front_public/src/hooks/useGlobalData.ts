import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { DbDataState } from '../types/dbTypes';
import { AppDataState } from '../types/appTypes';

// Database data hooks
export const useDbData = (): DbDataState => {
  return useSelector((state: RootState) => state.dbData);
};

export const useOrganisms = () => {
  return useSelector((state: RootState) => state.dbData.organisms);
};

export const useAssemblies = () => {
  return useSelector((state: RootState) => state.dbData.assemblies);
};

export const useSources = () => {
  return useSelector((state: RootState) => state.dbData.sources);
};

export const useConfigurations = () => {
  return useSelector((state: RootState) => state.dbData.configurations);
};

export const useDatasets = () => {
  return useSelector((state: RootState) => state.dbData.datasets);
};

// Helper to get specific items by ID
export const useOrganismById = (taxonomyId: number) => {
  return useSelector((state: RootState) => state.dbData.organisms[taxonomyId]);
};

export const useAssemblyById = (assemblyId: number) => {
  return useSelector((state: RootState) => state.dbData.assemblies[assemblyId]);
};

export const useSourceById = (sourceId: number) => {
  return useSelector((state: RootState) => state.dbData.sources[sourceId]);
};

export const useConfigurationById = (configurationId: number) => {
  return useSelector((state: RootState) => state.dbData.configurations[configurationId]);
};

export const useDatasetById = (datasetId: number) => {
  return useSelector((state: RootState) => state.dbData.datasets[datasetId]);
};

// App data hooks
export const useAppData = (): AppDataState => {
  return useSelector((state: RootState) => state.appData);
};

export const useAppSelections = () => {
  return useSelector((state: RootState) => state.appData.selections);
};

export const useSelectedOrganism = () => {
  const selections = useAppSelections();
  const organisms = useOrganisms();
  return selections.organism_id ? organisms[selections.organism_id] : null;
};

export const useSelectedAssembly = () => {
  const selections = useAppSelections();
  const assemblies = useAssemblies();
  return selections.assembly_id ? assemblies[selections.assembly_id] : null;
};

export const useSelectedSource = () => {
  const selections = useAppSelections();
  const sources = useSources();
  return selections.source_id ? sources[selections.source_id] : null;
};

export const useSelectedVersion = () => {
  const selections = useAppSelections();
  const source = useSelectedSource();
  return (selections.version_id && source?.versions) ? source.versions[selections.version_id] : null;
};

export const useSelectedConfiguration = () => {
  const selections = useAppSelections();
  const configurations = useConfigurations();
  return selections.configuration_id ? configurations[selections.configuration_id] : null;
};