import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GeneSearchState, GeneSearchResponse } from '../../types/geneTypes';

const initialState: GeneSearchState = {
  genes: [],
  pagination: null,
  filters: {
    search_term: null,
    sva_id: 0,
    gene_type: null,
    per_page: 25,
    sort_by: 'name',
    sort_order: 'asc'
  },
  loading: false,
  error: null,
  lastSearch: null,
};

const geneSearchSlice = createSlice({
  name: 'geneSearch',
  initialState,
  reducers: {
    setLoading(state) {
      state.loading = true;
      state.error = null;
    },
    setGeneSearchResults(state, action: PayloadAction<GeneSearchResponse>) {
      if (action.payload.success) {
        state.genes = action.payload.data;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
        state.lastSearch = action.payload.filters.search_term;
      } else {
        state.error = action.payload.message || 'Search failed';
      }
      state.loading = false;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearGeneSearch(state) {
      state.genes = [];
      state.pagination = null;
      state.filters = {
        search_term: null,
        sva_id: 0,
        gene_type: null,
        per_page: 25,
        sort_by: 'name',
        sort_order: 'asc'
      };
      state.loading = false;
      state.error = null;
      state.lastSearch = null;
    },
    setPage(state, action: PayloadAction<number>) {
      if (state.pagination) {
        state.pagination.current_page = action.payload;
      }
    },
    setGeneType(state, action: PayloadAction<string | null>) {
      if (state.filters) {
        state.filters.gene_type = action.payload;
      } else {
        // Initialize filters if they don't exist
        state.filters = {
          search_term: null,
          sva_id: 0,
          gene_type: action.payload,
          per_page: 25,
          sort_by: 'name',
          sort_order: 'asc'
        };
      }
    },
    setPerPage(state, action: PayloadAction<number>) {
      if (state.filters) {
        state.filters.per_page = action.payload;
      } else {
        // Initialize filters if they don't exist
        state.filters = {
          search_term: null,
          sva_id: 0,
          gene_type: null,
          per_page: action.payload,
          sort_by: 'name',
          sort_order: 'asc'
        };
      }
    },
  },
});

export const { 
  setLoading, 
  setGeneSearchResults, 
  setError, 
  clearGeneSearch,
  setPage,
  setGeneType,
  setPerPage
} = geneSearchSlice.actions;

export default geneSearchSlice.reducer; 