// src/redux/Explore/ExploreSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExploreState {
  items: any[];  // Replace 'any' with appropriate type for your data
  loading: boolean;
  error: string | null;
}

const initialState: ExploreState = {
  items: [],
  loading: false,
  error: null,
};

const exploreSlice = createSlice({
  name: 'explore',
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

export const { setItems, setLoading, setError } = exploreSlice.actions;
export default exploreSlice.reducer;
