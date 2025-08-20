// Data Interface - Easy import point for all data functionality

// Types
export * from './types/dbTypes';
export * from './types/appTypes';

// Redux - export specific items to avoid conflicts
export { 
    dbDataReducer, 
    setDbData, 
    clearDbData, 
    fetchDbData,
    setLoading as setDbLoading,
    setError as setDbError 
} from './redux/dbData';

export { 
    appDataReducer, 
    setOrganism, 
    setAssembly, 
    setSource, 
    setConfiguration, 
    setDataset, 
    setSelections, 
    clearSelections, 
    initializeAppSelections, 
    updateSelections,
    setLoading as setAppLoading,
    setError as setAppError,
    setInitialized
} from './redux/appData';

export { 
    setVersion,
    setNomenclature
} from './redux/appData/appDataSlice';

// Hooks - now exported from Redux hooks
export * from './redux/hooks';

// Utils
export * from './utils/dbDataBuilder';