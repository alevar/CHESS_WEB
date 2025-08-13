import { createSlice } from '@reduxjs/toolkit';
import { Source, Assembly, Organism, Configuration, Dataset, DataType } from '../../types';

export interface GlobalDataState {
  sources: { [source_id: number]: Source };
  assemblies: { [assembly_id: number]: Assembly };
  organisms: { [taxonomy_id: number]: Organism };
  configurations: { [configuration_id: number]: Configuration };
  datasets: {
    data_types: { [data_type: string]: DataType };
    datasets: { [dataset_id: number]: Dataset };
  };
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: GlobalDataState = {
  sources: {},
  assemblies: {},
  organisms: {},
  configurations: {},
  datasets: {
    data_types: {},
    datasets: {},
  },
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
      state.configurations = action.payload.configurations || {};
      state.datasets = action.payload.datasets || {
        data_types: {},
        datasets: {},
      };
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
      state.configurations = {};
      state.datasets = {
        data_types: {},
        datasets: {},
      };
      state.lastUpdated = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setLoading, setGlobalData, setError, clearGlobalData } = globalDataSlice.actions;
export default globalDataSlice.reducer; 