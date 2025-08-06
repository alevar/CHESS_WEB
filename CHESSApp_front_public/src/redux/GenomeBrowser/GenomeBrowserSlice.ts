import { createSlice } from '@reduxjs/toolkit';

interface GenomeBrowserState {
  config: any; // JBrowse2 config object
  loading: boolean;
  error: string | null;
}

const initialState: GenomeBrowserState = {
  config: null,
  loading: false,
  error: null,
};

const genomeBrowserSlice = createSlice({
  name: 'genomeBrowser',
  initialState,
  reducers: {
    setConfig(state, action) {
      state.config = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setConfig, setLoading, setError } = genomeBrowserSlice.actions;
export default genomeBrowserSlice.reducer; 