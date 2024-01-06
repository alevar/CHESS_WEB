import { configureStore } from '@reduxjs/toolkit';
import databaseSlice from '../features/database/databaseSlice';
import settingsSlice from '../features/settings/settingsSlice';
import { databaseApi } from '../features/database/databaseApi';

export const store = configureStore({
  reducer: {
    settings: settingsSlice,
    database: databaseSlice,
    [databaseApi.reducerPath]: databaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(databaseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;