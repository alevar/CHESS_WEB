import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { PDBState } from '../types/pdbTypes';

export const usePDBData = () => {
    const pdbData = useSelector((state: RootState) => state.pdb);
    
    const getPDBData = useCallback((): PDBState => {
        return pdbData;
    }, [pdbData]);

    return {
        getPDBData,
    };
}