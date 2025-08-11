// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import { dbDataReducer } from './dbData';
import { appDataReducer } from './appData';
import { downloadsReducer } from './dbData';
import { geneSearchReducer } from './geneSearch';
import { geneReducer } from './gene';
import { pdbReducer } from './pdb';

const rootReducer = combineReducers({
  dbData: dbDataReducer,
  appData: appDataReducer,
  downloads: downloadsReducer,
  geneSearch: geneSearchReducer,
  gene: geneReducer,
  pdb: pdbReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
