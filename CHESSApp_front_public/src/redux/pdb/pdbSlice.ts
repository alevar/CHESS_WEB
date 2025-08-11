import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PDBData {
  td_id: number;
  pdb_content: string;
  filename?: string;
  structure_info?: {
    title?: string;
    author?: string;
    resolution?: number;
    r_value?: number;
    r_free?: number;
    chains?: number;
    residues?: number;
    atoms?: number;
  };
}

export interface PDBState {
  pdbData: Record<number, PDBData>; // Keyed by td_id
  loading: Record<number, boolean>; // Loading state per td_id
  error: Record<number, string | null>; // Error state per td_id
  downloading: Record<number, boolean>; // Download state per td_id
}

const initialState: PDBState = {
  pdbData: {},
  loading: {},
  error: {},
  downloading: {}
};

const pdbSlice = createSlice({
  name: 'pdb',
  initialState,
  reducers: {
    setPDBLoading: (state, action: PayloadAction<{ td_id: number; loading: boolean }>) => {
      const { td_id, loading } = action.payload;
      state.loading[td_id] = loading;
      if (loading) {
        state.error[td_id] = null; // Clear error when starting to load
      }
    },
    setPDBData: (state, action: PayloadAction<{ td_id: number; data: PDBData }>) => {
      const { td_id, data } = action.payload;
      state.pdbData[td_id] = data;
      state.loading[td_id] = false;
      state.error[td_id] = null;
    },
    setPDBError: (state, action: PayloadAction<{ td_id: number; error: string }>) => {
      const { td_id, error } = action.payload;
      state.error[td_id] = error;
      state.loading[td_id] = false;
    },
    clearPDBData: (state, action: PayloadAction<number>) => {
      const td_id = action.payload;
      delete state.pdbData[td_id];
      delete state.loading[td_id];
      delete state.error[td_id];
    },
    clearAllPDBData: (state) => {
      state.pdbData = {};
      state.loading = {};
      state.error = {};
      state.downloading = {};
    },
    setPDBDownloading: (state, action: PayloadAction<{ td_id: number; downloading: boolean }>) => {
      const { td_id, downloading } = action.payload;
      state.downloading[td_id] = downloading;
    }
  }
});

export const { 
  setPDBLoading, 
  setPDBData, 
  setPDBError, 
  clearPDBData, 
  clearAllPDBData,
  setPDBDownloading
} = pdbSlice.actions;

export default pdbSlice.reducer; 