import { combineReducers } from '@reduxjs/toolkit';
import { dbDataReducer } from './dbData';
import { appDataReducer } from './appData';
import { downloadsReducer } from './downloads';
import { geneSearchReducer } from './geneSearch';
import { geneReducer, cmpTranscriptReducer } from './gene';
import { pdbReducer } from './pdb';

const rootReducer = combineReducers({
  dbData: dbDataReducer,
  appData: appDataReducer,
  downloads: downloadsReducer,
  geneSearch: geneSearchReducer,
  gene: geneReducer,
  cmpTranscript: cmpTranscriptReducer,
  pdb: pdbReducer,
});

export default rootReducer;