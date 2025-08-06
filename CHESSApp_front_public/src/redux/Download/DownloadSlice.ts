import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchLatestRelease, parseGitReleaseBody } from '../../utils/githubUtils';
import { GitHubRelease, ParsedReleaseData } from '../../types/github';

interface DownloadState {
  loading: boolean;
  error: string | null;
  releaseData: {
    release: GitHubRelease;
    parsedData: ParsedReleaseData;
  } | null;
}

const initialState: DownloadState = {
  loading: false,
  error: null,
  releaseData: null,
};

// Async thunk for fetching release data
export const fetchReleaseData = createAsyncThunk(
  'download/fetchReleaseData',
  async () => {
    const release = await fetchLatestRelease();
    const parsedData = parseGitReleaseBody(release.body);
    return { release, parsedData };
  }
);

const downloadSlice = createSlice({
  name: 'download',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDownloadState: (state) => {
      state.loading = false;
      state.error = null;
      state.releaseData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReleaseData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReleaseData.fulfilled, (state, action) => {
        state.loading = false;
        state.releaseData = action.payload;
      })
      .addCase(fetchReleaseData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch release data';
      });
  },
});

export const { clearError, resetDownloadState } = downloadSlice.actions;
export default downloadSlice.reducer; 