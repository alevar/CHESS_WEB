import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PDBState, PDBData } from '../../types/pdbTypes';

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
        state.error[td_id] = null;
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