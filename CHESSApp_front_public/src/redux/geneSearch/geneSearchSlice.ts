import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GeneSearchState, GeneSearchParams } from '../../types/geneTypes';
import { searchGenes } from './geneSearchThunks';

const defaultFilters: GeneSearchParams = {
  sva_id: 0,
  search_term: null,
  gene_type: null,
  per_page: 25,
  sort_by: 'name',
  sort_order: 'asc'
};

const initialState: GeneSearchState = {
  genes: [],
  pagination: null,
  filters: defaultFilters,
  loading: false,
  error: null,
};

const geneSearchSlice = createSlice({
  name: 'geneSearch',
  initialState,
  reducers: {
    updateFilters(state, action: PayloadAction<Partial<GeneSearchParams>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearGeneSearch() {
      return { ...initialState, filters: { ...defaultFilters } };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchGenes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGenes.fulfilled, (state, action) => {
        state.loading = false;
        state.genes = action.payload.data;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(searchGenes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      });
  },
});

export const { updateFilters, clearGeneSearch } = geneSearchSlice.actions;
export default geneSearchSlice.reducer;