import { createSlice } from '@reduxjs/toolkit';
import { Source, Assembly, Organism } from '../../types';

export interface GlobalDataState {
  sources: { [source_id: number]: Source };
  assemblies: { [assembly_id: number]: Assembly };
  organisms: { [taxonomy_id: number]: Organism };
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: GlobalDataState = {
  sources: {},
  assemblies: {},
  organisms: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

const globalDataSlice = createSlice({
  name: 'globalData',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setGlobalData(state, action) {
      state.sources = action.payload.sources || {};
      state.assemblies = action.payload.assemblies || {};
      state.organisms = action.payload.organisms || {};
      state.loading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    setError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearGlobalData(state) {
      state.sources = {};
      state.assemblies = {};
      state.organisms = {};
      state.lastUpdated = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setGlobalData, setError, clearGlobalData } = globalDataSlice.actions;
export default globalDataSlice.reducer; 