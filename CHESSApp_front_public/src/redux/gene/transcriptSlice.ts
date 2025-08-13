import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  exons: Array<[number, number]>; // [start, end] tuples
  cds: Array<[number, number]>; // [start, end] tuples
  nt_sequence: string;
  cds_sequence?: string | null; // CDS sequence (coding region) - can be null for non-coding transcripts
  cds_aa_sequence?: string | null; // Translated amino acid sequence - can be null for non-coding transcripts
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
    [key: string]: any; // Allow for additional attributes
  };
}

export interface TranscriptState {
  currentTranscript: FullTranscriptData | null;
  loading: boolean;
  error: string | null;
}

const initialState: TranscriptState = {
  currentTranscript: null,
  loading: false,
  error: null,
};

const transcriptSlice = createSlice({
  name: 'transcript',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setTranscriptData(state, action: PayloadAction<FullTranscriptData>) {
      state.currentTranscript = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.currentTranscript = null;
    },
    clearTranscriptData(state) {
      state.currentTranscript = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setTranscriptData, 
  setError, 
  clearTranscriptData 
} = transcriptSlice.actions;

export default transcriptSlice.reducer; 