// Admin-specific types that are used across the application
export interface DatabaseTableInfo {
  name: string;
  type: 'table' | 'view';
  description: string;
  error?: string;
}

export interface DatabaseTableData {
  columns: string[];
  rows: any[][];
  search_term?: string;
}

export interface TranscriptDataUpload {
  dataset_id: number;
  organism_id: number;
  assembly_id: number;
  source_id: number;
  source_version_id: number;
  data_type: string;
  file: File;
}