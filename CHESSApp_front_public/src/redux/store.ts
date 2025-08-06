// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { lociApi } from './GenomeBrowser/lociApi';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(lociApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
