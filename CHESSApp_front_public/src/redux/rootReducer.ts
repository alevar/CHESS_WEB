// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import appDataReducer from './App/AppSlice';
import exploreReducer from './Explore/ExploreSlice';
import downloadReducer from './Download/DownloadSlice';
import genomeBrowserReducer from './GenomeBrowser/GenomeBrowserSlice';
import customAnnotationReducer from './CustomAnnotation/CustomAnnotationSlice';
import { lociApi } from './GenomeBrowser/lociApi';

const rootReducer = combineReducers({
  global: appDataReducer,
  explore: exploreReducer,
  download: downloadReducer,
  genomeBrowser: genomeBrowserReducer,
  customAnnotation: customAnnotationReducer,
  [lociApi.reducerPath]: lociApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
