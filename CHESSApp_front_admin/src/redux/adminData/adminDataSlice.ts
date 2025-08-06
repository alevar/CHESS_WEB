import { createSlice } from '@reduxjs/toolkit';
import { } from './adminDataThunks';
import { 
  DatabaseTableInfo, 
  DatabaseTableData
} from '../../types';

export interface DatabaseListResponse {
  tables: DatabaseTableInfo[];
  views: DatabaseTableInfo[];
  total_tables: number;
  total_views: number;
}

export interface DatabaseTableDataResponse {
  table_name: string;
  data: DatabaseTableData;
  search_term?: string;
  limit: number;
}

export interface AdminDataState {
  loading: boolean;
  error: string | null;
  currentOperation: string | null;
}

const initialState: AdminDataState = {
  loading: false,
  error: null,
  currentOperation: null,
};

const adminDataSlice = createSlice({
  name: 'adminData',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = true;
      state.error = null;
      state.currentOperation = action.payload || null;
    },
    setError(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.currentOperation = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearOperation(state) {
      state.loading = false;
      state.currentOperation = null;
    },
  },
  extraReducers: (builder) => {
    
  },
});

export const { setLoading, setError, clearError, clearOperation } = adminDataSlice.actions;
export default adminDataSlice.reducer; 