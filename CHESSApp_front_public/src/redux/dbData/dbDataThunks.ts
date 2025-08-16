import { createAsyncThunk } from '@reduxjs/toolkit';
import { DbDataState } from '../../types/dbTypes';
import type { RootState } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const fetchDbData = createAsyncThunk<
  Omit<DbDataState, 'loading' | 'error' | 'lastUpdated'>,
  void,
  { state: RootState }
>(
  'dbData/fetchDbData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/globalData`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        organisms: data.organisms || {},
        assemblies: data.assemblies || {},
        sources: data.sources || {},
        configurations: data.configurations || {},
        datasets: data.datasets || { datasets: {}, data_types: {} },
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Network error');
    }
  },
  {
    condition: (_, { getState }) => {
      const { dbData } = getState();
      // Skip fetching if data already loaded or currently loading
      const hasData =
        Object.keys(dbData.organisms).length > 0 &&
        Object.keys(dbData.assemblies).length > 0 &&
        Object.keys(dbData.sources).length > 0;

      if (hasData || dbData.loading) {
        return false;
      }
    }
  }
);
