import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { 
    AppSettings,
    AppDataState
} from '../types/appTypes';

import {
    DbDataState,
    Organism,
    Assembly,
    Source,
    SourceVersion,
    SourceVersionAssembly,
    Configuration,
    Dataset,
    DataType,
    TranscriptData
} from '../types/dbTypes';


export const useAppData = () => {
    const appData = useSelector((state: RootState) => state.appData);
    
    const getAppData = useCallback((): AppDataState => {
        return appData;
    }, [appData]);

    return {
        getAppData,
    };
}