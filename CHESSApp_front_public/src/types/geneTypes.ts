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

export interface GeneSearchParams {
  sva_id: number;
  search_term?: string | null;
  gene_type?: string | null;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface GeneSearchResponse {
  data: Gene[];
  pagination: GeneSearchPagination;
  filters: GeneSearchParams;
  success: boolean;
  message?: string;
}

export interface GeneSearchState {
  genes: Gene[];
  pagination: GeneSearchPagination | null;
  filters: GeneSearchParams;
  loading: boolean;
  error: string | null;
}