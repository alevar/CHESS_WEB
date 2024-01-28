import { configureStore } from '@reduxjs/toolkit';
import databaseSlice from '../features/database/databaseSlice';
import settingsSlice from '../features/settings/settingsSlice';
import summarySlice from '../features/summary/summarySlice';
import genesSlice from '../features/genes/genesSlice';
import { databaseApi } from '../features/database/databaseApi';
import { summaryApi } from '../features/summary/summaryApi';
import { genesApi } from '../features/genes/genesApi';

export const store = configureStore({
  reducer: {
    settings: settingsSlice,
    database: databaseSlice,
    summary: summarySlice,
    genes: genesSlice,
    [databaseApi.reducerPath]: databaseApi.reducer,
    [summaryApi.reducerPath]: summaryApi.reducer,
    [genesApi.reducerPath]: genesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(databaseApi.middleware).concat(summaryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;