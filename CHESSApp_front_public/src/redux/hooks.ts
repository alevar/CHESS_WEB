// src/redux/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { DbDataState } from '../types/dbTypes';
import { AppDataState } from '../types/appTypes';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Database data hooks
export const useDbData = (): DbDataState => {
  return useAppSelector((state: RootState) => state.dbData);
};

export const useOrganisms = () => {
  return useAppSelector((state: RootState) => state.dbData.organisms);
};

export const useAssemblies = () => {
  return useAppSelector((state: RootState) => state.dbData.assemblies);
};

export const useSources = () => {
  return useAppSelector((state: RootState) => state.dbData.sources);
};

export const useConfigurations = () => {
  return useAppSelector((state: RootState) => state.dbData.configurations);
};

export const useDatasets = () => {
  return useAppSelector((state: RootState) => state.dbData.datasets);
};

// Helper to get specific items by ID
export const useOrganismById = (taxonomyId: number) => {
  return useAppSelector((state: RootState) => state.dbData.organisms[taxonomyId]);
};

export const useAssemblyById = (assemblyId: number) => {
  return useAppSelector((state: RootState) => state.dbData.assemblies[assemblyId]);
};

export const useSourceById = (sourceId: number) => {
  return useAppSelector((state: RootState) => state.dbData.sources[sourceId]);
};

export const useConfigurationById = (configurationId: number) => {
  return useAppSelector((state: RootState) => state.dbData.configurations[configurationId]);
};

export const useDatasetById = (datasetId: number) => {
  return useAppSelector((state: RootState) => state.dbData.datasets[datasetId]);
};

// App data hooks
export const useAppData = (): AppDataState => {
  return useAppSelector((state: RootState) => state.appData);
};

export const useAppSelections = () => {
  return useAppSelector((state: RootState) => state.appData.selections);
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

export const useSelectedNomenclature = () => {
  const selections = useAppSelections();
  return selections.nomenclature || null;
};

// Gene data hooks
export const useGeneData = () => {
  return useAppSelector((state: RootState) => state.gene);
};

export const useCurrentGene = () => {
  return useAppSelector((state: RootState) => state.gene.currentGene);
};

export const useGeneLoading = () => {
  return useAppSelector((state: RootState) => state.gene.loading);
};

export const useGeneError = () => {
  return useAppSelector((state: RootState) => state.gene.error);
};

// PDB data hooks
export const usePDBData = () => {
  return useAppSelector((state: RootState) => state.pdb);
};

export const usePDBByTdId = (td_id: number) => {
  return useAppSelector((state: RootState) => ({
    data: state.pdb.pdbData[td_id],
    loading: state.pdb.loading[td_id] || false,
    error: state.pdb.error[td_id] || null
  }));
};

export const usePDBLoading = (td_id: number) => {
  return useAppSelector((state: RootState) => state.pdb.loading[td_id] || false);
};

export const usePDBError = (td_id: number) => {
  return useAppSelector((state: RootState) => state.pdb.error[td_id] || null);
};

export const usePDBDownloading = (td_id: number) => {
  return useAppSelector(state => state.pdb.downloading[td_id] || false);
};

// Transcript data hooks
export const useTranscriptData = () => {
  return useAppSelector((state: RootState) => state.transcript);
};

export const useCurrentTranscript = () => {
  return useAppSelector((state: RootState) => state.transcript.currentTranscript);
};

export const useTranscriptLoading = () => {
  return useAppSelector((state: RootState) => state.transcript.loading);
};

export const useTranscriptError = () => {
  return useAppSelector((state: RootState) => state.transcript.error);
};