import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface SettingsState {
  value: {
    format: 'GTF' | 'GFF',
    species: number,
    genome: number,
    nomenclature: string,
    sources_include: number[],
    prime3_UTR_extension: number,
    prime5_UTR_extension: number,
    include_nascent: boolean,
    include_fasta: boolean,
    exclude_y_chromosome: boolean,
    attributes: Record<number, Record<string, number[]>>,
    source_intersections: number[][],
  },
  status: 'loading' | 'idle',
}

const initialState: SettingsState = {
  value: {
    format: 'GTF',
    species: 1,
    genome: 1,
    nomenclature: 'UCSC',
    sources_include: [],
    prime3_UTR_extension: 0,
    prime5_UTR_extension: 0,
    include_nascent: false,
    include_fasta: false,
    exclude_y_chromosome: false,
    attributes: {},
    source_intersections: [],
  },
  status: 'loading',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<'loading' | 'idle'>) => {
      state.status = action.payload;
    },
    setOrganism: (state, action: PayloadAction<number>) => {
      state.value.species = action.payload;
    },
    setAssembly: (state, action: PayloadAction<number>) => {
      state.value.genome = action.payload;
    },
    setNascent: (state, action: PayloadAction<boolean>) => {
      state.value.include_nascent = action.payload;
    },
    setIncludeSources: (state, action: PayloadAction<number[]>) => {
      state.value.sources_include = action.payload;
    },
    addSource: (state, action: PayloadAction<number>) => {
      state.value.sources_include.push(action.payload);
    },
    removeSource: (state, action: PayloadAction<number>) => {
      state.value.sources_include = state.value.sources_include.filter((source) => source !== action.payload);
    },
    setAttributes: (state, action: PayloadAction<Record<number, Record<string, number[]>>>) => {
      state.value.attributes = action.payload;
    },
    addAttribute: (state, action: PayloadAction<[string, number, number]>) => {
      const [key, source_id, value] = action.payload;
      if (!state.value.attributes[source_id]) {
        state.value.attributes[source_id] = {};
      }
      if (!state.value.attributes[source_id][key]) {
        state.value.attributes[source_id][key] = [];
      }
      state.value.attributes[source_id][key].push(value);
    },
    removeAttribute: (state, action: PayloadAction<[string, number, number]>) => {
      const [key, source_id, value] = action.payload;
      if (state.value.attributes[source_id]) {
        if (state.value.attributes[source_id][key]) {
          state.value.attributes[source_id][key] = state.value.attributes[source_id][key].filter((v) => v !== value);
          if (state.value.attributes[source_id][key].length === 0) {
            delete state.value.attributes[source_id][key];
          }
          if (Object.keys(state.value.attributes[source_id]).length === 0) {
            delete state.value.attributes[source_id];
          }
        }
      }
    },
    addSourceIntersection: (state, action: PayloadAction<number[]>) => {
      state.value.source_intersections.push(action.payload);
    },
    removeSourceIntersection: (state, action: PayloadAction<number[]>) => {
      state.value.source_intersections = state.value.source_intersections.filter(
        (intersection) => JSON.stringify(intersection) !== JSON.stringify(action.payload)
      );
    },
    setFormat: (state, action: PayloadAction<'GTF' | 'GFF'>) => {
      state.value.format = action.payload;
    },
    setNomenclature: (state, action: PayloadAction<string>) => {
      state.value.nomenclature = action.payload;
    },
  },
});

export const {
  setStatus,
  setOrganism,
  setAssembly,
  setNascent,
  setIncludeSources,
  addSource,
  removeSource,
  setAttributes,
  addAttribute,
  removeAttribute,
  addSourceIntersection,
  removeSourceIntersection,
  setFormat,
  setNomenclature,
} = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings.value;

export default settingsSlice.reducer;
