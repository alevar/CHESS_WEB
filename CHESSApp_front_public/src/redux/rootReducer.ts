import { combineReducers } from '@reduxjs/toolkit';
import { dbDataReducer } from './dbData';
import { appDataReducer } from './appData';
import { downloadsReducer } from './downloads';

const rootReducer = combineReducers({
  dbData: dbDataReducer,
  appData: appDataReducer,
  downloads: downloadsReducer,
});

export default rootReducer;