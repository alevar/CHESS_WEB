import { createSlice } from '@reduxjs/toolkit';
import { DbDataState } from '../../types/dbTypes';

const initialState: DbDataState = {
  sources: {},
  assemblies: {},
  organisms: {},
  configurations: {},
  datasets: {},
  loading: false,
  error: null,
  lastUpdated: null,
};

const dbDataSlice = createSlice({
  name: 'dbData',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setDbData(state, action) {
      state.sources = action.payload.sources || {};
      state.assemblies = action.payload.assemblies || {};
      state.organisms = action.payload.organisms || {};
      state.configurations = action.payload.configurations || {};
      state.datasets = action.payload.datasets || {};
      state.loading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    setError(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearDbData(state) {
      state.sources = {};
      state.assemblies = {};
      state.organisms = {};
      state.configurations = {};
      state.datasets = {};
      state.lastUpdated = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setDbData, setError, clearDbData } = dbDataSlice.actions;
export default dbDataSlice.reducer;