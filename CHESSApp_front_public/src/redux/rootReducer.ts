// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import { dbDataReducer } from './dbData';
import { appDataReducer } from './appData';

const rootReducer = combineReducers({
  dbData: dbDataReducer,
  appData: appDataReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
