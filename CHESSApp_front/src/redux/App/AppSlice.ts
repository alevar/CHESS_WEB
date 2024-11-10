import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Organism, Assembly, Source } from '../../types/db';

interface AppDataState {
  data: {
    organisms: Organism[];
    assemblies: Assembly[];
    sources: Source[];
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppDataState = {
  data: null,
  loading: false,
  error: null,
};

const appDataSlice = createSlice({
  name: 'appData',
  initialState,
  reducers: {
    setAppData: (state, action: PayloadAction<any>) => {
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
  },
});

export const { setAppData, setLoading, setError } = appDataSlice.actions;
export default appDataSlice.reducer;
