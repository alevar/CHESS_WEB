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


// Gene and Transcript State Interface
export interface Transcript {
  tid: number;
  transcript_id: string;
  transcript_type: string;
  sequence_id: number;
  strand: boolean;
  coordinates: {
    start: number;
    end: number;
  };
  exons: Array<[number, number]>;
  cds: Array<[number, number]>;
  datasets: Array<{
    dataset_id: number;
    dataset_name: string;
    dataset_description: string;
    data_type: string;
    data_entries: Array<{
      td_id: number;
      data: string;
    }>;
  }>;
}

export interface GeneWithTranscripts {
  gid: number;
  sva_id: number;
  gene_id: string;
  name: string;
  gene_type: string;
  transcripts: Transcript[];
}

export interface GeneCoordinates {
  sequence_id: string;
  start: number;
  end: number;
  strand: boolean;
}

export interface GeneState {
  geneData: GeneWithTranscripts | null;
  loading: boolean;
  error: string | null;
}

export interface GeneResponse {
  success: boolean;
  data: GeneWithTranscripts;
  message?: string;
}

// Types for the full transcript data from the backend endpoint
export interface FullTranscriptData {
  tid: number;
  transcript_id: string;
  transcript_type: string;
  sequence_id: number;
  strand: boolean;
  coordinates: {
    start: number;
    end: number;
  };
  exons: Array<[number, number]>;
  cds: Array<[number, number]>;
  nt_sequence: string;
  cds_sequence?: string | null;
  cds_aa_sequence?: string | null;
  datasets: Array<{
    dataset_id: number;
    dataset_name: string;
    dataset_description: string;
    data_type: string;
    data_entries: Array<{
      td_id: number;
      data: string;
    }>;
  }>;
  attributes: {
    gene_id: string;
    gene_name: string;
    gene_type: string;
    transcript_type: string;
    sequence_id: number;
    [key: string]: any;
  };
}

export interface CmpTranscriptState {
  primaryTranscript: FullTranscriptData | null;
  secondaryTranscript: FullTranscriptData | null;
  primaryLoading: boolean;
  secondaryLoading: boolean;
  primaryError: string | null;
  secondaryError: string | null;
}

export interface TranscriptResponse {
  success: boolean;
  data: FullTranscriptData;
  message?: string;
}