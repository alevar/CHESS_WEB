import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { SettingsState } from '../settings/settingsSlice';

export const databaseApi = createApi({
  reducerPath: 'databaseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/main',
    credentials: "same-origin",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  }),
  endpoints: (builder) => ({
    getGlobalData: builder.query<object[], void>({
      query: () => ({
        url: '/globalData',
        method: 'GET',
      }),
      transformResponse: (response: object) => { // useful in case we need to do anything to the response before caching it        
        // create a map of organisms to a list of assemblies
        let assemblyMap: { [key: number]: number[] } = {};
        for (let [key, value] of Object.entries(response['assemblies'])) {
          const organismID = Number(value["organismID"]);
          if (!assemblyMap.hasOwnProperty(organismID)) {
            assemblyMap[organismID] = [];
          }
          assemblyMap[organismID].push(key);
        }
        response['org2asss'] = assemblyMap;

        // construct map of assemblies to sources
        let sourceMap: { [key: number]: number[] } = {};
        for (let [key, value] of Object.entries(response['sources'])) {
          const assemblyID = Number(value["assemblyID"]);
          if (!sourceMap.hasOwnProperty(assemblyID)) {
            sourceMap[assemblyID] = [];
          }
          sourceMap[assemblyID].push(key);
        }
        response['ass2src'] = sourceMap;

        // extract attribute information
        // source to attribute map: sourceID -> attribute key -> list of kvids
        let src2attr: { [key: number]: { [key: string]: number[] } } = {};
        for (let [key, value] of Object.entries(response['attributes'])) {
          for (let sourceID of value["sources"]) {
            if (!src2attr.hasOwnProperty(sourceID)) {
              src2attr[sourceID] = {};
            }
            src2attr[sourceID][value["key"]] = key;
          }
        }

        // attribute key to attribute values
        
        return response;
      },
    }),

    getTxSummarySlice: builder.query<object, void>({
      query: (settings) => ({
        url: '/txSummarySlice',
        method: 'POST',
        body: settings,
      }),
      transformResponse: (response: object) => {
        return response;
      },
    }),
  }),
});

export const { useGetGlobalDataQuery, useGetTxSummarySliceQuery } = databaseApi;