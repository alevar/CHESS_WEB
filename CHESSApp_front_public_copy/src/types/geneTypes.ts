// Gene Search Types
export interface Gene {
  gid: number;
  sva_id: number;
  name: string;
  type_key: string;
  type_value: string;
  gene_id: string;
  transcript_count: number;
  coordinates: {
    sequence_id: string;
    start: number;
    end: number;
    strand: boolean | null;
  };
}

export interface GeneSearchPagination {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface GeneSearchFilters {
  search_term: string | null;
  sva_id: number;
  gene_type: string | null;
  per_page: number;
  sort_by: string;
  sort_order: string;
}

export interface GeneSearchResponse {
  success: boolean;
  data: Gene[];
  pagination: GeneSearchPagination;
  filters: GeneSearchFilters;
  message?: string;
}

export interface GeneSearchState {
  genes: Gene[];
  pagination: GeneSearchPagination | null;
  filters: GeneSearchFilters | null;
  loading: boolean;
  error: string | null;
  lastSearch: string | null;
} 