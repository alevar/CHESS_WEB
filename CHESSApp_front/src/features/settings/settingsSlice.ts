import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState, AppThunk } from "../../app/store"

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
        }
}

const initialState: SettingsState = {
  value: {format : "gtf",
          species : "human",
          genome : "hg38",
          nomenclature : "ucsc",
          gene_types : ["protein_coding"],
          sources : ["CHESS"],
          prime3_UTR_extension : 0,
          prime5_UTR_extension : 0,
          include_nascent : false,
          include_fasta : false,
        }
}

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    set_nascent: (state, action: PayloadAction<boolean>) => {
      state.value.include_nascent = action.payload
    },
  }
})

export const { set_nascent } = settingsSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSettings = (state: RootState) => state.settings.value

export default settingsSlice.reducer
