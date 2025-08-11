import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setGeneSearchResults, setError } from './geneSearchSlice';
import { GeneSearchResponse } from '../../types/geneTypes';

const API_BASE_URL = 'http://localhost:5000/api';

export interface GeneSearchParams {
  sva_id: number;
  search_term?: string;
  gene_type?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
}

export const searchGenes = createAsyncThunk(
  'geneSearch/searchGenes',
  async (params: GeneSearchParams, { dispatch }) => {
    dispatch(setLoading());
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('sva_id', params.sva_id.toString());
      
      if (params.search_term) {
        searchParams.append('q', params.search_term);
      }
      if (params.gene_type) {
        searchParams.append('gene_type', params.gene_type);
      }
      if (params.page) {
        searchParams.append('page', params.page.toString());
      }
      if (params.per_page) {
        searchParams.append('per_page', params.per_page.toString());
      }
      if (params.sort_by) {
        searchParams.append('sort', params.sort_by);
      }
      if (params.sort_order) {
        searchParams.append('order', params.sort_order);
      }

      const response = await fetch(`${API_BASE_URL}/public/genes/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GeneSearchResponse = await response.json();
      
      if (data.success) {
        dispatch(setGeneSearchResults(data));
      } else {
        dispatch(setError(data.message || 'Search failed'));
      }
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search genes';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

export const searchGenesWithPage = createAsyncThunk(
  'geneSearch/searchGenesWithPage',
  async (params: GeneSearchParams, { dispatch, getState }) => {
    try {
      const result = await dispatch(searchGenes(params)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }
); 