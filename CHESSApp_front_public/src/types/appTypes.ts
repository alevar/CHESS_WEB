export interface AppDataState {
  selections: {
    organism_id: number | null;
    assembly_id: number | null;
    source_id: number | null;
    version_id: number | null;
    nomenclature: string | null;
  };
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

// Type for URL parameters
export interface UrlParams {
  organism?: string;
  assembly?: string;
  source?: string;
  version?: string;
  nomenclature?: string;
  [key: string]: string | undefined;
}

// Type for parsed selections
export interface AppSettings {
  organism_id: number;
  assembly_id: number;
  source_id: number;
  version_id: number;
  nomenclature: string;
}