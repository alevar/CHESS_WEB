import { createSlice } from '@reduxjs/toolkit';

interface CustomAnnotationState {
  includedGeneTypes: string[];
  excludedGeneTypes: string[];
  includedTranscriptTypes: string[];
  excludedTranscriptTypes: string[];
  additionalCatalogues: string[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomAnnotationState = {
  includedGeneTypes: [],
  excludedGeneTypes: [],
  includedTranscriptTypes: [],
  excludedTranscriptTypes: [],
  additionalCatalogues: [],
  loading: false,
  error: null,
};

const customAnnotationSlice = createSlice({
  name: 'customAnnotation',
  initialState,
  reducers: {
    setIncludedGeneTypes(state, action) {
      state.includedGeneTypes = action.payload;
    },
    setExcludedGeneTypes(state, action) {
      state.excludedGeneTypes = action.payload;
    },
    setIncludedTranscriptTypes(state, action) {
      state.includedTranscriptTypes = action.payload;
    },
    setExcludedTranscriptTypes(state, action) {
      state.excludedTranscriptTypes = action.payload;
    },
    setAdditionalCatalogues(state, action) {
      state.additionalCatalogues = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setIncludedGeneTypes,
  setExcludedGeneTypes,
  setIncludedTranscriptTypes,
  setExcludedTranscriptTypes,
  setAdditionalCatalogues,
  setLoading,
  setError,
} = customAnnotationSlice.actions;
export default customAnnotationSlice.reducer; 