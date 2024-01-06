import { createSlice } from '@reduxjs/toolkit';
import { databaseApi } from './databaseApi';

export interface DatabaseState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: object[];
  error: string | null;
}

const initialState: DatabaseState = {
  status: 'idle',
  data: [],
  error: null,
};

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(databaseApi.endpoints.getGlobalData.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addMatcher(databaseApi.endpoints.getGlobalData.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(databaseApi.endpoints.getGlobalData.matchRejected, (state) => {
        state.status = 'failed';
        state.error = "Error";
      });
  },
});

export default databaseSlice.reducer;