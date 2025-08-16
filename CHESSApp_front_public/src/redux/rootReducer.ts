import { combineReducers } from '@reduxjs/toolkit';
import { dbDataReducer } from './dbData';
import { appDataReducer } from './appData';

const rootReducer = combineReducers({
  dbData: dbDataReducer,
  appData: appDataReducer,
});

export default rootReducer;