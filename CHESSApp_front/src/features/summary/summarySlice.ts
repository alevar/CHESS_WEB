import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { summaryApi } from './summaryApi';

export interface SummaryState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: { summary: object };
  error: string | null;
}

const initialState: SummaryState = {
  status: 'idle',
  data: { summary: {} },
  error: null,
};

const summarySlice = createSlice({
  name: 'summary',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(summaryApi.endpoints.getTxSummarySlice.matchFulfilled, (state, action: PayloadAction<object>) => {
        state.status = 'succeeded';
        state.data = action.payload as { summary: object };
        state.error = null;
      })
      .addMatcher(summaryApi.endpoints.getTxSummarySlice.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(summaryApi.endpoints.getTxSummarySlice.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export const { clearError } = summarySlice.actions;

export default summarySlice.reducer;
