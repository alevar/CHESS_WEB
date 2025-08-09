import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDataState } from '../../types/appTypes';

const initialState: AppDataState = {
  selections: {
    organism_id: null,
    assembly_id: null,
    source_id: null,
    version_id: null,
    nomenclature: null,
    configuration_id: null,
    dataset_id: null,
  },
  loading: false,
  error: null,
  initialized: false,
};

const appDataSlice = createSlice({
  name: 'appData',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
      state.loading = false;
    },
    
    // Selection setters
    setOrganism(state, action: PayloadAction<number>) {
      state.selections.organism_id = action.payload;
      // Clear downstream selections when organism changes
      state.selections.assembly_id = null;
      state.selections.source_id = null;
      state.selections.configuration_id = null;
    },
    setAssembly(state, action: PayloadAction<number>) {
      state.selections.assembly_id = action.payload;
      // Clear downstream selections when assembly changes
      state.selections.source_id = null;
      state.selections.configuration_id = null;
    },
    setSource(state, action: PayloadAction<number>) {
      state.selections.source_id = action.payload;
      // Clear downstream selections when source changes
      state.selections.version_id = null;
      state.selections.configuration_id = null;
    },
    setVersion(state, action: PayloadAction<number>) {
      state.selections.version_id = action.payload;
      // Clear downstream selections when version changes
      state.selections.configuration_id = null;
    },
    setNomenclature(state, action: PayloadAction<string>) {
      state.selections.nomenclature = action.payload;
    },
    setConfiguration(state, action: PayloadAction<number>) {
      state.selections.configuration_id = action.payload;
    },
    setDataset(state, action: PayloadAction<number>) {
      state.selections.dataset_id = action.payload;
    },
    
    // Bulk selection setter
    setSelections(state, action: PayloadAction<Partial<AppDataState['selections']>>) {
      state.selections = { ...state.selections, ...action.payload };
    },
    
    // Clear all selections
    clearSelections(state) {
      state.selections = {
        organism_id: null,
        assembly_id: null,
        source_id: null,
        version_id: null,
        nomenclature: null,
        configuration_id: null,
        dataset_id: null,
      };
    },
  },
});

export const {
  setLoading,
  setError,
  setInitialized,
  setOrganism,
  setAssembly,
  setSource,
  setVersion,
  setNomenclature,
  setConfiguration,
  setDataset,
  setSelections,
  clearSelections,
} = appDataSlice.actions;

export default appDataSlice.reducer;