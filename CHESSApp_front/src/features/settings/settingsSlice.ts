import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"

export interface SettingsState {
  value: {format : string,
          species : string,
          genome : string,
          nomenclature : string,
          gene_types : string[],
          sources : string[],
          prime3_UTR_extension : number,
          prime5_UTR_extension : number,
          include_nascent : boolean,
          include_fasta : boolean,
          attributes : Record<string, string[]>
        }
}

const initialState: SettingsState = {
  value: {format : "GTF",
          species : "HomoSapiens",
          genome : "GRCh38",
          nomenclature : "UCSC",
          gene_types : ["protein_coding"],
          sources : ["CHESS.3.0"],
          prime3_UTR_extension : 0,
          prime5_UTR_extension : 0,
          include_nascent : false,
          include_fasta : false,
          attributes : {}
        }
}

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    set_organism: (state, action: PayloadAction<string>) => {
      state.value.species = action.payload
    },
    set_assembly: (state, action: PayloadAction<string>) => {
      state.value.genome = action.payload
    },
    set_nascent: (state, action: PayloadAction<boolean>) => {
      state.value.include_nascent = action.payload
    },
    set_select_sources: (state, action: PayloadAction<string[]>) => {
      state.value.sources = action.payload;
    },
    clear_sources: (state) => {
      state.value.sources = []
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

export const { set_organism,
               set_assembly,
               set_nascent,
               set_select_sources,
               set_format,
               set_nomenclature } = settingsSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSettings = (state: RootState) => state.settings.value

export default settingsSlice.reducer
