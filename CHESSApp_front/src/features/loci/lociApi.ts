import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { TX, Locus } from '../../utils/utils';

export const lociApi = createApi({
  reducerPath: 'lociApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/main',
    credentials: "same-origin",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  }),
  endpoints: (builder) => ({
    getLociSummary: builder.query<object, void>({
      query: (settings) => {
        return {
          url: '/getLociSummary',
          method: 'POST',
          body: settings,
        };
      },
      transformResponse: (response: object) => {
        return response;
      },
    }),
    findLoci: builder.query<object, void>({
      query: (term) => {
        return {
          url: '/findLoci',
          method: 'POST',
          body: term,
        };
      },
      transformResponse: (response: object) => {
        return response;
      },
    }),
    getLocus: builder.query<object, void>({
      query: (lid) => {
        return {
          url: '/getLocus',
          method: 'POST',
          body: lid,
        };
      },
      transformResponse: (response: object) => {
        for ( const [ tid, txData ] of Object.entries(response.data.transcripts) ) {
          txData.intron_chain.sort((a: number[], b: number[]) => a[0]-b[0]);
          const num_exons = txData.intron_chain.length+1;
          let exons: number[][] = Array.from({ length: num_exons }, () => [0, 0]);
          exons[0][0] = txData.transcript_start; // set the first exon start to the transcript start
          exons[num_exons-1][1] = txData.transcript_end; // set the last exon end to the transcript end
          // fill the rest with introns
          for ( let i = 0; i < num_exons-1; i++ ) {
            exons[i][1] = Number(txData.intron_chain[i][0])-1;
            exons[i+1][0] = Number(txData.intron_chain[i][1])+1;
          }
          response.data.transcripts[tid]['exons'] = exons;
        }
        return response;
      },
    }),
  }),
});

export const { useGetLociSummaryQuery, useFindLociQuery, useGetLocusQuery } = lociApi;