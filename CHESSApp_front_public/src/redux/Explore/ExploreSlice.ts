// src/redux/Explore/ExploreSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface GeneInfo {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface ExploreState {
  results: GeneInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: ExploreState = {
  results: [],
  loading: false,
  error: null,
};

export const fetchGeneInfo = createAsyncThunk(
  'explore/fetchGeneInfo',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/genes?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch gene info');
      return (await response.json()) as GeneInfo[];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGeneInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGeneInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchGeneInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default exploreSlice.reducer;
