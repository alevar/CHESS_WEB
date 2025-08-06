import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomDownloadState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomDownloadState = {
  items: [],
  loading: false,
  error: null,
};

const customDownloadSlice = createSlice({
  name: 'customDownload',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    setLoading: (state) => {
      state.loading = true;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setItems, setLoading, setError } = customDownloadSlice.actions;
export default customDownloadSlice.reducer;
