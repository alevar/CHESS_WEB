import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  items: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: 'search',
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

export const { setItems, setLoading, setError } = searchSlice.actions;
export default searchSlice.reducer;
