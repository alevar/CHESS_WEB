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
      query: (settings) => ({
        url: '/globalData',
        method: 'POST',
        body: settings,
      }),
      transformResponse: (response: object) => { // useful in case we need to do anything to the response before caching it        
        // create a map of organisms to a list of assemblies
        let assemblyMap: { [key: number]: number[] } = {};
        for (let [key, value] of Object.entries(response['assemblies'])) {
          const oid = Number(value["organismID"]);
          if (!assemblyMap.hasOwnProperty(oid)) {
            assemblyMap[oid] = [];
          }
          assemblyMap[oid].push(key);
        }
        response['o2a'] = assemblyMap;

        
        return response;
      },
    }),

    getTxSummarySlice: builder.query<object, void>({
      query: (settings: SettingsState) => ({
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

export const { useGetGlobalDataQuery } = databaseApi;