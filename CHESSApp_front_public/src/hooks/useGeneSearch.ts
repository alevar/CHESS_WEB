import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { GeneSearchState } from '../types/geneTypes';

export const useGeneSearch = () => {
    const geneSearch = useSelector((state: RootState) => state.geneSearch);
    
    const getGeneSearch = useCallback((): GeneSearchState => {
        return geneSearch;
    }, [geneSearch]);

    return {
        getGeneSearch,
    };
}