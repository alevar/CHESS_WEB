import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FullTranscriptData, CmpTranscriptState as CmpTranscriptState } from '../../types/geneTypes';

const initialState: CmpTranscriptState = {
  primaryTranscript: null,
  secondaryTranscript: null,
  primaryLoading: false,
  secondaryLoading: false,
  primaryError: null,
  secondaryError: null,
};

const transcriptSlice = createSlice({
  name: 'cmpTranscript',
  initialState,
  reducers: {
    setPrimaryLoading(state) {
      state.primaryLoading = true;
      state.primaryError = null;
    },
    setSecondaryLoading(state) {
      state.secondaryLoading = true;
      state.secondaryError = null;
    },
    setPrimaryTranscriptData(state, action: PayloadAction<FullTranscriptData>) {
      state.primaryTranscript = action.payload;
      state.primaryLoading = false;
      state.primaryError = null;
    },
    setSecondaryTranscriptData(state, action: PayloadAction<FullTranscriptData>) {
      state.secondaryTranscript = action.payload;
      state.secondaryLoading = false;
      state.secondaryError = null;
    },
    setPrimaryError(state, action: PayloadAction<string>) {
      state.primaryLoading = false;
      state.primaryError = action.payload;
      state.primaryTranscript = null;
    },
    setSecondaryError(state, action: PayloadAction<string>) {
      state.secondaryLoading = false;
      state.secondaryError = action.payload;
      state.secondaryTranscript = null;
    },
    clearPrimaryTranscriptData(state) {
      state.primaryTranscript = null;
      state.primaryLoading = false;
      state.primaryError = null;
    },
    clearSecondaryTranscriptData(state) {
      state.secondaryTranscript = null;
      state.secondaryLoading = false;
      state.secondaryError = null;
    },
  },
});

export const { 
  setPrimaryLoading, 
  setSecondaryLoading,
  setPrimaryTranscriptData, 
  setSecondaryTranscriptData,
  setPrimaryError, 
  setSecondaryError,
  clearPrimaryTranscriptData,
  clearSecondaryTranscriptData
} = transcriptSlice.actions;

export default transcriptSlice.reducer; 