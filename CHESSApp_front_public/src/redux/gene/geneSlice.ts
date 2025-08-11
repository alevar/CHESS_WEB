import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types for the detailed gene data from the backend
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
  exons: Array<[number, number]>; // [start, end] tuples
  cds: Array<[number, number]>; // [start, end] tuples
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

export interface DetailedGene {
  gid: number;
  sva_id: number;
  gene_id: string;
  name: string;
  gene_type: string;
  transcripts: Transcript[];
}

export interface GeneState {
  currentGene: DetailedGene | null;
  loading: boolean;
  error: string | null;
}

const initialState: GeneState = {
  currentGene: null,
  loading: false,
  error: null,
};

const geneSlice = createSlice({
  name: 'gene',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setGeneData(state, action: PayloadAction<DetailedGene>) {
      state.currentGene = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.currentGene = null;
    },
    clearGeneData(state) {
      state.currentGene = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setGeneData, 
  setError, 
  clearGeneData 
} = geneSlice.actions;

export default geneSlice.reducer; 