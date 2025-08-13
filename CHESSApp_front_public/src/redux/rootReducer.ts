// src/redux/rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import { dbDataReducer } from './dbData';
import { appDataReducer } from './appData';
import { downloadsReducer } from './dbData';
import { geneSearchReducer } from './geneSearch';
import { geneReducer } from './gene';
import { pdbReducer } from './pdb';
import { transcriptReducer } from './gene/transcriptIndex';

const rootReducer = combineReducers({
  dbData: dbDataReducer,
  appData: appDataReducer,
  downloads: downloadsReducer,
  geneSearch: geneSearchReducer,
  gene: geneReducer,
  pdb: pdbReducer,
  transcript: transcriptReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
