import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GeneState, GeneWithTranscripts } from '../../types/geneTypes';

const initialState: GeneState = {
  geneData: null,
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
    setGeneData(state, action: PayloadAction<GeneWithTranscripts>) {
      state.geneData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.geneData = null;
    },
    clearGeneData(state) {
      state.geneData = null;
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