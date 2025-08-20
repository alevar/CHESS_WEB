import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setError, setInitialized, setSelections } from './appDataSlice';
import { RootState } from '../store';

// Initialize app selections from URL parameters or defaults
export const initializeAppSelections = createAsyncThunk(
  'appData/initializeAppSelections',
  async (params: { 
    organism_id?: number; 
    assembly_id?: number; 
    source_id?: number; 
    version_id?: number; 
    nomenclature?: string; 
  }, { dispatch, getState }) => {
    dispatch(setLoading());
    try {
      const state = getState() as RootState;
      const { dbData } = state;
      
      // Set default values if not provided
      const organism_id = params.organism_id || 1;
      const assembly_id = params.assembly_id || 1;
      
      // Validate selections against available data
      const organism = dbData.organisms[organism_id];
      const assembly = dbData.assemblies[assembly_id];
      
      if (!organism) {
        throw new Error(`Organism with ID ${organism_id} not found`);
      }
      
      if (!assembly) {
        throw new Error(`Assembly with ID ${assembly_id} not found`);
      }
      
      // Check if assembly belongs to organism
      if (assembly.taxonomy_id !== organism.taxonomy_id) {
        throw new Error(`Assembly ${assembly_id} does not belong to organism ${organism_id}`);
      }
      
      // Validate additional selections if provided
      const selections: any = { organism_id, assembly_id };
      
      if (params.source_id && dbData.sources[params.source_id]) {
        selections.source_id = params.source_id;
      }
      
      if (params.version_id && params.source_id) {
        const source = dbData.sources[params.source_id];
        if (source?.versions && source.versions[params.version_id]) {
          selections.version_id = params.version_id;
          
          // Compute sva_id from source -> version -> assembly path
          const version = source.versions[params.version_id];
          if (version?.assemblies) {
            // Find the sva that matches our assembly_id
            const svaEntry = Object.values(version.assemblies).find(sva => sva.assembly_id === assembly_id);
            if (svaEntry) {
              selections.sva_id = svaEntry.sva_id;
            }
          }
        }
      }
      
      if (params.nomenclature && assembly.nomenclatures?.includes(params.nomenclature)) {
        selections.nomenclature = params.nomenclature;
      }
      
      // Set the validated selections
      dispatch(setSelections(selections));
      dispatch(setInitialized(true));
      
      return selections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize app selections';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);

// Update selections and validate them
export const updateSelections = createAsyncThunk(
  'appData/updateSelections',
  async (newSelections: Partial<{ organism_id: number; assembly_id: number; source_id: number }>, { dispatch, getState }) => {
    dispatch(setLoading());
    try {
      const state = getState() as RootState;
      const { dbData } = state;
      
      // Get current selections
      const currentSelections = state.appData.selections;
      const updatedSelections = { ...currentSelections, ...newSelections };
      
      // Validate the new selections
      if (updatedSelections.organism_id && !dbData.organisms[updatedSelections.organism_id]) {
        throw new Error(`Organism with ID ${updatedSelections.organism_id} not found`);
      }
      
      if (updatedSelections.assembly_id && !dbData.assemblies[updatedSelections.assembly_id]) {
        throw new Error(`Assembly with ID ${updatedSelections.assembly_id} not found`);
      }
      
      // Validate organism-assembly relationship
      if (updatedSelections.organism_id && updatedSelections.assembly_id) {
        const organism = dbData.organisms[updatedSelections.organism_id];
        const assembly = dbData.assemblies[updatedSelections.assembly_id];
        
        if (organism && assembly && assembly.taxonomy_id !== organism.taxonomy_id) {
          throw new Error(`Assembly ${updatedSelections.assembly_id} does not belong to organism ${updatedSelections.organism_id}`);
        }
      }
      
      dispatch(setSelections(newSelections));
      
      return updatedSelections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update selections';
      dispatch(setError(errorMessage));
      throw error;
    }
  }
);