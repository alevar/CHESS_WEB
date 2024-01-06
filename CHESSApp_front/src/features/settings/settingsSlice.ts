import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"

export interface SettingsState {
  value: {format : string,
          species : number,
          genome : number,
          nomenclature : string,
          sources_include : number[],
          prime3_UTR_extension : number,
          prime5_UTR_extension : number,
          include_nascent : boolean,
          include_fasta : boolean,
          exclude_y_chromosome : boolean,
          attributes : Record<number,Record<string, number[]>>
        },
  status: "loading" | "idle"
}

const initialState: SettingsState = {
  value: {format : "GTF",
          species : 1,
          genome : 1,
          nomenclature : "UCSC",
          sources_include : [],
          prime3_UTR_extension : 0,
          prime5_UTR_extension : 0,
          include_nascent : false,
          include_fasta : false,
          exclude_y_chromosome : false,
          attributes : {}
        },
  status: "loading"
}

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    set_status: (state, action: PayloadAction<"loading" | "idle">) => {
      state.status = action.payload;
    },
    set_organism: (state, action: PayloadAction<number>) => {
      state.value.species = action.payload;
    },
    set_assembly: (state, action: PayloadAction<number>) => {
      state.value.genome = action.payload
    },
    set_nascent: (state, action: PayloadAction<boolean>) => {
      state.value.include_nascent = action.payload
    },
    set_include_sources: (state, action: PayloadAction<number[]>) => {
      state.value.sources_include = action.payload;
    },
    add_source: (state, action: PayloadAction<number>) => {
      state.value.sources_include.push(action.payload);
    },
    remove_source: (state, action: PayloadAction<number>) => {
      state.value.sources_include = state.value.sources_include.filter((source) => source !== action.payload);
    },
    set_attributes: (state, action: PayloadAction<Record<number,Record<string, number[]>>>) => {
      state.value.attributes = action.payload;
    },
    add_attribute: (state, action: PayloadAction<[number,number]>) => {
      state.value.attributes[action.payload[0]].push(action.payload[1]);
    },
    remove_attribute: (state, action: PayloadAction<[number,number]>) => {
      state.value.attributes[action.payload[0]] = state.value.attributes[action.payload[0]].filter((attr) => attr !== action.payload[1]);
    },
    set_format: (state, action: PayloadAction<string>) => {
      // make sure it is either gtf or gff
      if (action.payload === "GTF" || action.payload === "GFF") {
        state.value.format = action.payload
      }
      else {
        state.value.format = "GTF"
        console.log("Invalid format, defaulting to gtf")
      }
    },
    set_nomenclature: (state, action: PayloadAction<string>) => {
      state.value.nomenclature = action.payload
    },
  }
})

export const { set_status,
               set_organism,
               set_assembly,
               set_nascent,
               set_include_sources, add_source, remove_source,
               set_attributes, add_attribute, remove_attribute,
               set_format,
               set_nomenclature } = settingsSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSettings = (state: RootState) => state.settings.value

export default settingsSlice.reducer
