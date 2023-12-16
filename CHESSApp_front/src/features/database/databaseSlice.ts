import { createSlice } from '@reduxjs/toolkit';
import { databaseApi } from './databaseApi';

const databaseSlice = createSlice({
  name: 'database',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(databaseApi.endpoints.getSequenceById.matchFulfilled, (state, action) => {
      return {sequences: action.payload,
              status: 'succeeded'};
    })
    .addMatcher(databaseApi.endpoints.getSequenceById.matchPending, (state, action) => {
      return { status: 'loading' };
    })
    .addMatcher(databaseApi.endpoints.getSequenceById.matchRejected, (state, action) => {
      return { status: 'failed',
               error: 'An error occurred'};
    });
  },
});

export default databaseSlice.reducer;