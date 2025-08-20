import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { AppDataState } from '../types/appTypes';

export const useAppData = () => {
    const appData = useSelector((state: RootState) => state.appData);
    
    const getAppData = useCallback((): AppDataState => {
        return appData;
    }, [appData]);

    return {
        getAppData,
    };
}