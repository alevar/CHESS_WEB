import { createSlice } from '@reduxjs/toolkit';
import { DbDataState } from '../../types/dbTypes';
import { fetchDbData } from './dbDataThunks';

const initialState: DbDataState = {
  sources: {},
  assemblies: {},
  organisms: {},
  configurations: {},
  datasets: {
    datasets: {},
    data_types: {},
  },
  loading: false,
  error: null,
  lastUpdated: null,
};

const dbDataSlice = createSlice({
  name: 'dbData',
  initialState,
  reducers: {
    clearDbData(state) {
      Object.assign(state, initialState);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDbData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDbData.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDbData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch database data';
      });
  },
});

export const { clearDbData, clearError } = dbDataSlice.actions;
export default dbDataSlice.reducer;