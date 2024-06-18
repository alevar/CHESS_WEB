import { createSlice } from '@reduxjs/toolkit';
import { databaseApi } from './databaseApi';

// Define interface for database state
export interface DatabaseState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: GlobalDataResponse;
  error: string | null;
}

const initialState: DatabaseState = {
  status: 'idle',
  data: {
    assemblies: {},
    sources: {},
    attributes: {},
    gene_types: {},
    transcript_types: {},
  },
  error: null,
};

// Rename the slice to `globalDataSlice`
const globalDataSlice = createSlice({
  name: 'globalData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(databaseApi.endpoints.getGlobalData.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addMatcher(databaseApi.endpoints.getGlobalData.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(databaseApi.endpoints.getGlobalData.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default globalDataSlice.reducer;
