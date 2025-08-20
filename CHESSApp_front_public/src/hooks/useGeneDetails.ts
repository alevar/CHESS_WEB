import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

import {
    FullTranscriptData,
    GeneState,
    CmpTranscriptState,
    GeneCoordinates,
    Transcript,
} from '../types/geneTypes';


export const useGeneDetails = () => {
    const geneDetails = useSelector((state: RootState) => state.gene);
    
    const getGeneDetails = useCallback((): GeneState | null => {
        return geneDetails;
    }, [geneDetails]);

    const getGeneCoordinates = useCallback((): GeneCoordinates | null => {
        const geneCoordinates = geneDetails.geneData?.transcripts.length && geneDetails.geneData.transcripts.length > 0 ? {
            sequence_id: geneDetails.geneData.transcripts[0].sequence_id.toString(),
            start: Math.min(...geneDetails.geneData.transcripts.map((t: Transcript) => t.coordinates.start)),
            end: Math.max(...geneDetails.geneData.transcripts.map((t: Transcript) => t.coordinates.end)),
            strand: geneDetails.geneData.transcripts[0].strand
          } : null;
        return geneCoordinates;
    }, [geneDetails]);

    const getTranscriptCount = useCallback((): number => {
        return geneDetails.geneData?.transcripts.length || 0;
    }, [geneDetails]);

    return {
        getGeneDetails,
        getGeneCoordinates,
        getTranscriptCount,
    };
}

export const useCmpTranscript = () => {
    const cmpTranscript = useSelector((state: RootState) => state.cmpTranscript);

    const getCmpTranscript = useCallback((): CmpTranscriptState | null => {
        return cmpTranscript;
    }, [cmpTranscript]);

    const getPrimaryTranscriptDetails = useCallback((): FullTranscriptData | null => {
        return cmpTranscript.primaryTranscript;
    }, [cmpTranscript]);

    const getSecondaryTranscriptDetails = useCallback((): FullTranscriptData | null => {
        return cmpTranscript.secondaryTranscript;
    }, [cmpTranscript]);

    return {
        getCmpTranscript,
        getPrimaryTranscriptDetails,
        getSecondaryTranscriptDetails,
        primaryLoading: cmpTranscript.primaryLoading,
        secondaryLoading: cmpTranscript.secondaryLoading,
        primaryError: cmpTranscript.primaryError,
        secondaryError: cmpTranscript.secondaryError,
    };
}