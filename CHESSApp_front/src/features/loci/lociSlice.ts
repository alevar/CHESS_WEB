import { createSlice } from '@reduxjs/toolkit';
import { lociApi } from './lociApi';

export interface BaseState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: object;
  error: string | null;
}

const initialState: Record<string,BaseState> = {
  summary:{
    status: 'loading',
    data: [],
    error: null,
  },
  search:{
    status: 'loading',
    data: [],
    error: null,
  },
  locus:{
    status: 'loading',
    data: [],
    error: null,
  }
};

const loci = createSlice({
  name: 'loci',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // summary matchers
      .addMatcher(lociApi.endpoints.getLociSummary.matchFulfilled, (state, action) => {
        state.summary.status = 'succeeded';
        state.summary.data = action.payload;
      })
      .addMatcher(lociApi.endpoints.getLociSummary.matchPending, (state) => {
        state.summary.status = 'loading';
      })
      .addMatcher(lociApi.endpoints.getLociSummary.matchRejected, (state) => {
        state.summary.status = 'failed';
        state.summary.error = "Error";
      })

      // search matchers
      .addMatcher(lociApi.endpoints.findLoci.matchFulfilled, (state, action) => {
        state.search.status = 'succeeded';
        state.search.data = action.payload;
      })
      .addMatcher(lociApi.endpoints.findLoci.matchPending, (state) => {
        state.search.status = 'loading';
      })
      .addMatcher(lociApi.endpoints.findLoci.matchRejected, (state) => {
        state.search.status = 'failed';
        state.search.error = "Error";
      })

      // locus details matchers
      .addMatcher(lociApi.endpoints.getLocus.matchFulfilled, (state, action) => {
        state.locus.status = 'succeeded';
        state.locus.data = action.payload;
      })
      .addMatcher(lociApi.endpoints.getLocus.matchPending, (state) => {
        state.locus.status = 'loading';
      })
      .addMatcher(lociApi.endpoints.getLocus.matchRejected, (state) => {
        state.locus.status = 'failed';
        state.locus.error = "Error";
      });
  },
});

export default loci.reducer;