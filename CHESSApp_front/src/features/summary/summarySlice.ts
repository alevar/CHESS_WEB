import { createSlice } from '@reduxjs/toolkit';
import { summaryApi } from './summaryApi';

export interface SummaryState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: object[];
  error: string | null;
}

const initialState: SummaryState = {
  status: 'loading',
  data: [],
  error: null,
};

const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(summaryApi.endpoints.getTxSummarySlice.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addMatcher(summaryApi.endpoints.getTxSummarySlice.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(summaryApi.endpoints.getTxSummarySlice.matchRejected, (state) => {
        state.status = 'failed';
        state.error = "Error";
      });
  },
});

export default summarySlice.reducer;