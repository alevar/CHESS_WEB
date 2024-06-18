import { configureStore } from '@reduxjs/toolkit';
import databaseSlice from '../features/database/databaseSlice';
import settingsSlice from '../features/settings/settingsSlice';
import summarySlice from '../features/summary/summarySlice';
import lociSummary from '../features/loci/lociSlice';
import { databaseApi } from '../features/database/databaseApi';
import { summaryApi } from '../features/summary/summaryApi';
import { lociApi } from '../features/loci/lociApi';

export const store = configureStore({
  reducer: {
    settings: settingsSlice,
    database: databaseSlice,
    summary: summarySlice,
    loci: lociSummary,
    [databaseApi.reducerPath]: databaseApi.reducer,
    [summaryApi.reducerPath]: summaryApi.reducer,
    [lociApi.reducerPath]: lociApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(
      databaseApi.middleware, 
      summaryApi.middleware, 
      lociApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
