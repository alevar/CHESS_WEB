import { combineReducers } from '@reduxjs/toolkit';
import { globalDataReducer } from './globalData';
import { adminDataReducer } from './adminData';

const rootReducer = combineReducers({
  globalData: globalDataReducer,
  adminData: adminDataReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 