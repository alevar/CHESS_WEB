// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import { dbDataReducer } from './dbData';
import { appDataReducer } from './appData';
import { downloadsReducer } from './dbData';

const rootReducer = combineReducers({
  dbData: dbDataReducer,
  appData: appDataReducer,
  downloads: downloadsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
