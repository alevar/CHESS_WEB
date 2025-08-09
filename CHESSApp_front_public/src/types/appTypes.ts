// App Data Types - for storing user selections and app state

export interface AppDataState {
  selections: {
    organism_id: number | null;
    assembly_id: number | null;
    source_id: number | null;
    version_id: number | null;
    sva_id: number | null;
    nomenclature: string | null;
    configuration_id: number | null;
    dataset_id: number | null;
  };
  loading: boolean;
  error: string | null;
  initialized: boolean;
}