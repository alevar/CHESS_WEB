import { configureStore } from '@reduxjs/toolkit';
import databaseSlice from '../features/database/databaseSlice';
import { databaseApi } from '../features/database/databaseApi';

export const store = configureStore({
  reducer: {
    database: databaseSlice,
    [databaseApi.reducerPath]: databaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(databaseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;