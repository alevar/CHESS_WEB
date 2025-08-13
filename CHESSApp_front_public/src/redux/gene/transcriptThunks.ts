import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setTranscriptData, setError } from './transcriptSlice';
import { FullTranscriptData } from './transcriptSlice';

const API_BASE_URL = 'http://localhost:5000/api';

export interface TranscriptResponse {
  success: boolean;
  data: FullTranscriptData;
  message?: string;
}

export const fetchFullTranscriptData = createAsyncThunk(
  'transcript/fetchFullTranscriptData',
  async ({ tid, transcript_id, assembly_id, nomenclature }: { tid: number; transcript_id: string; assembly_id: number; nomenclature: string }, { dispatch }) => {
    dispatch(setLoading());
    try {
      const response = await fetch(`${API_BASE_URL}/public/transcript_data?tid=${tid}&transcript_id=${transcript_id}&assembly_id=${assembly_id}&nomenclature=${nomenclature}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TranscriptResponse = await response.json();
      
      if (data.success) {
        dispatch(setTranscriptData(data.data));
        return data.data;
      } else {
        const errorMessage = data.message || 'Failed to fetch transcript data';
        dispatch(setError(errorMessage));
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transcript data';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
); 