import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { DownloadsState } from '../types/downloadsTypes';

export const useDownloads = () => {
    const downloads = useSelector((state: RootState) => state.downloads);
    
    const getDownloads = useCallback((): DownloadsState => {
        return downloads;
    }, [downloads]);

    return {
        getDownloads,
    };
}