import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setTranscriptData, setError, setSecondaryLoading, setSecondaryTranscriptData, setSecondaryError } from './transcriptSlice';
import { FullTranscriptData } from './transcriptSlice';

const API_BASE_URL = 'http://localhost:5000/api';

export interface TranscriptResponse {
  success: boolean;
  data: FullTranscriptData;
  message?: string;
}

export interface FetchTranscriptParams {
  tid: number;
  transcript_id: string;
  assembly_id: number;
  nomenclature: string;
  isSecondary?: boolean;
}

export const fetchTranscriptData = createAsyncThunk(
  'transcript/fetchTranscriptData',
  async ({ tid, transcript_id, assembly_id, nomenclature, isSecondary = false }: FetchTranscriptParams, { dispatch }) => {
    // Set loading state based on whether it's secondary or primary
    if (isSecondary) {
      dispatch(setSecondaryLoading());
    } else {
      dispatch(setLoading());
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/public/transcript_data?tid=${tid}&transcript_id=${transcript_id}&assembly_id=${assembly_id}&nomenclature=${nomenclature}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TranscriptResponse = await response.json();
      
      if (data.success) {
        // Set data based on whether it's secondary or primary
        if (isSecondary) {
          dispatch(setSecondaryTranscriptData(data.data));
        } else {
          dispatch(setTranscriptData(data.data));
        }
        return data.data;
      } else {
        const errorMessage = data.message || `Failed to fetch ${isSecondary ? 'secondary ' : ''}transcript data`;
        if (isSecondary) {
          dispatch(setSecondaryError(errorMessage));
        } else {
          dispatch(setError(errorMessage));
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${isSecondary ? 'secondary ' : ''}transcript data`;
      if (isSecondary) {
        dispatch(setSecondaryError(errorMessage));
      } else {
        dispatch(setError(errorMessage));
      }
      throw error;
    }
  }
);

// Keep the old function for backward compatibility, but mark as deprecated
export const fetchFullTranscriptData = createAsyncThunk(
  'transcript/fetchFullTranscriptData',
  async (params: Omit<FetchTranscriptParams, 'isSecondary'>, { dispatch }) => {
    return dispatch(fetchTranscriptData({ ...params, isSecondary: false })).unwrap();
  }
);

export const fetchSecondaryTranscriptData = createAsyncThunk(
  'transcript/fetchSecondaryTranscriptData',
  async (params: Omit<FetchTranscriptParams, 'isSecondary'>, { dispatch }) => {
    return dispatch(fetchTranscriptData({ ...params, isSecondary: true })).unwrap();
  }
); 