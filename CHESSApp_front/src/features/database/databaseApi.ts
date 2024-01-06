import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
          assemblyMap[organismID].push(Number(key));
        }
        response['org2ass'] = assemblyMap;

        // construct map of assemblies to sources
        let sourceMap: { [key: number]: number[] } = {};
        for (let [key, value] of Object.entries(response['sources'])) {
          const sourceID = Number(key)
          const assemblyID = Number(value["assemblyID"]);
          if (!sourceMap.hasOwnProperty(assemblyID)) {
            sourceMap[assemblyID] = [];
          }
          sourceMap[assemblyID].push(sourceID);
        }
        response['ass2src'] = sourceMap;

        // extract attribute information
        // source to attribute map: sourceID -> attribute key -> list of kvids
        let src2attr: { [key: number]: { [key: string]: number[] } } = {};
        for (let [key, value] of Object.entries(response['attributes'])) {
          const kvid = Number(key);
          for (let sourceID of value["sources"].map(Number)) {
            if (!src2attr.hasOwnProperty(sourceID)) {
              src2attr[sourceID] = {};
            }
            if (!src2attr[sourceID].hasOwnProperty(value["key"])) {
              src2attr[sourceID][value["key"]] = [];
            }
            src2attr[sourceID][value["key"]].push(Number(kvid));
          }
        }
        response['src2attr'] = src2attr;

        // extract gene_type information
        // source to gene_type map: sourceID -> gene_type -> list of kvids
        let src2gt: { [key: number]: { [key: string]: number[] } } = {};
        for (let [key, value] of Object.entries(response['gene_types'])) {
          const kvid = Number(key);
          for (let sourceID of value["sources"].map(Number)) {
            if (!src2gt.hasOwnProperty(sourceID)) {
              src2gt[sourceID] = [];
            }
            src2gt[sourceID].push(Number(kvid));
          }
        }
        response['src2gt'] = src2gt;

        // extract transcript_type information
        // source to transcript_type map: sourceID -> transcript_type -> list of kvids
        let src2tt: { [key: number]: { [key: string]: number[] } } = {};
        for (let [key, value] of Object.entries(response['transcript_types'])) {
          const kvid = Number(key);
          for (let sourceID of value["sources"].map(Number)) {
            if (!src2tt.hasOwnProperty(sourceID)) {
              src2tt[sourceID] = [];
            }
            src2tt[sourceID].push(Number(kvid));
          }
        }
        response['src2tt'] = src2tt;

        return response;
      },
    }),
  }),
});

export const { useGetGlobalDataQuery } = databaseApi;