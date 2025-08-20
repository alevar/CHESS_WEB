import { createAsyncThunk } from '@reduxjs/toolkit';
import { setPDBLoading, setPDBData, setPDBError, setPDBDownloading } from './pdbSlice';
import { PDBData } from './pdbSlice';

const API_BASE_URL = 'http://localhost:5000/api';

export interface PDBResponse {
  success: boolean;
  data: PDBData;
  message?: string;
}

export const fetchPDBByTdId = createAsyncThunk(
  'pdb/fetchPDBByTdId',
  async (td_id: number, { dispatch }) => {
    dispatch(setPDBLoading({ td_id, loading: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/public/pdb/${td_id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PDBResponse = await response.json();
      
      if (data.success) {
        dispatch(setPDBData({ td_id, data: data.data }));
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch PDB data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch PDB data';
      dispatch(setPDBError({ td_id, error: errorMessage }));
      throw error;
    }
  }
);

export const fetchMultiplePDBs = createAsyncThunk(
  'pdb/fetchMultiplePDBs',
  async (td_ids: number[], { dispatch }) => {
    const results = await Promise.allSettled(
      td_ids.map(td_id => dispatch(fetchPDBByTdId(td_id)).unwrap())
    );
    
    return results.map((result, index) => ({
      td_id: td_ids[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
); 

export const downloadPDBFile = createAsyncThunk(
  'pdb/downloadPDBFile',
  async (td_id: number, { dispatch }) => {
    dispatch(setPDBDownloading({ td_id, downloading: true }));
    
    try {
      // Create a temporary anchor element to trigger the download - same as your working version
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}/public/pdb_download/${td_id}`;
      link.target = '_blank'; // This is key - same as your working downloads
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      dispatch(setPDBDownloading({ td_id, downloading: false }));
      return { success: true, td_id };
    } catch (error) {
      dispatch(setPDBDownloading({ td_id, downloading: false }));
      const errorMessage = error instanceof Error ? error.message : 'Failed to download PDB file';
      throw new Error(errorMessage);
    }
  }
);