import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DB } from '../../types/db';

interface AppState {
  data: DB | null;
  loading: boolean;
  error: string | null;
  settings: {
    organism_id: number;
    assembly_id: number;
  };
}

const initialState: AppState = {
  data: null,
  loading: false,
  error: null,
  settings: {
    organism_id: 1,
    assembly_id: 1,
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Data-related reducers
    setAppData: (state, action: PayloadAction<DB>) => {
      state.data = action.payload;
      state.loading = false;
    },
    setLoading: (state) => {
      state.loading = true;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Settings-related reducers
    setOrganism: (state, action: PayloadAction<number>) => {
      state.settings.organism_id = action.payload;
    },
    setAssembly: (state, action: PayloadAction<number>) => {
      state.settings.assembly_id = action.payload;
    },
  },
});

export const { setAppData, setLoading, setError, setOrganism, setAssembly } = appSlice.actions;
export default appSlice.reducer;
