// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import appDataReducer from './App/AppSlice';
import exploreReducer from './Explore/ExploreSlice';
import searchReducer from './Search/SearchSlice';
import customDownloadReducer from './CustomDownload/CustomDownloadSlice';

const rootReducer = combineReducers({
  global: appDataReducer,
  explore: exploreReducer,
  search: searchReducer,
  customDownload: customDownloadReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
