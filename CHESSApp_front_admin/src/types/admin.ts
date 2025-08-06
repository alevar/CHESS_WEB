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