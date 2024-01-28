import { createSlice } from '@reduxjs/toolkit';
import { genesApi } from './genesApi';

export interface GenesState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: object;
  error: string | null;
}

const initialState: GenesState = {
  status: 'loading',
  data: {},
  error: null,
};

const genesSlice = createSlice({
  name: 'genes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(genesApi.endpoints.getGenesSlice.matchFulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addMatcher(genesApi.endpoints.getGenesSlice.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(genesApi.endpoints.getGenesSlice.matchRejected, (state) => {
        state.status = 'failed';
        state.error = "Error";
      });
  },
});

export default genesSlice.reducer;