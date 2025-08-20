import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDataState, AppSettings } from '../../types/appTypes';
import { DbDataState } from '../../types/dbTypes';
import { validateSelections } from '../../utils/validationUtils';

const initialState: AppDataState = {
  selections: {
    organism_id: null,
    assembly_id: null,
    source_id: null,
    version_id: null,
    nomenclature: null,
  },
  loading: false,
  error: null,
  initialized: false,
};

const appDataSlice = createSlice({
  name: 'appData',
  initialState,
  reducers: {
    setAppSelections(state, action: PayloadAction<{ selections: AppSettings; dbData: DbDataState }>) {
      const { selections, dbData } = action.payload;
      const isValid = validateSelections(selections, dbData);

      if (isValid) {
        state.selections = selections;
        state.initialized = true;
        state.error = null;
      } else {
        state.error = 'Invalid configuration parameters.';
      }
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const { setAppSelections, setError } = appDataSlice.actions;
export default appDataSlice.reducer;
