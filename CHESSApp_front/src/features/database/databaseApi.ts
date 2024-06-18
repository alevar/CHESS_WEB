import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define interfaces for response data
interface Assembly {
  organismID: number;
}

interface Source {
  assemblyID: number;
}

interface Attribute {
  sources: number[];
  key: string;
}

interface GeneType {
  sources: number[];
}

interface TranscriptType {
  sources: number[];
}

interface GlobalDataResponse {
  assemblies: Record<string, Assembly>;
  sources: Record<string, Source>;
  attributes: Record<string, Attribute>;
  gene_types: Record<string, GeneType>;
  transcript_types: Record<string, TranscriptType>;
}

const createAssemblyMap = (assemblies: Record<string, Assembly>) => {
  let assemblyMap: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(assemblies)) {
    const organismID = Number(value.organismID);
    if (!assemblyMap.hasOwnProperty(organismID)) {
      assemblyMap[organismID] = [];
    }
    assemblyMap[organismID].push(Number(key));
  }
  return assemblyMap;
};

const createSourceMap = (sources: Record<string, Source>) => {
  let sourceMap: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(sources)) {
    const sourceID = Number(key);
    const assemblyID = Number(value.assemblyID);
    if (!sourceMap.hasOwnProperty(assemblyID)) {
      sourceMap[assemblyID] = [];
    }
    sourceMap[assemblyID].push(sourceID);
  }
  return sourceMap;
};

const createAttrMap = (attributes: Record<string, Attribute>) => {
  let src2attr: { [key: number]: { [key: string]: number[] } } = {};
  for (let [key, value] of Object.entries(attributes)) {
    const kvid = Number(key);
    for (let sourceID of value.sources.map(Number)) {
      if (!src2attr.hasOwnProperty(sourceID)) {
        src2attr[sourceID] = {};
      }
      if (!src2attr[sourceID].hasOwnProperty(value.key)) {
        src2attr[sourceID][value.key] = [];
      }
      src2attr[sourceID][value.key].push(kvid);
    }
  }
  return src2attr;
};

const createGeneTypeMap = (geneTypes: Record<string, GeneType>) => {
  let src2gt: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(geneTypes)) {
    const kvid = Number(key);
    for (let sourceID of value.sources.map(Number)) {
      if (!src2gt.hasOwnProperty(sourceID)) {
        src2gt[sourceID] = [];
      }
      src2gt[sourceID].push(kvid);
    }
  }
  return src2gt;
};

const createTranscriptTypeMap = (transcriptTypes: Record<string, TranscriptType>) => {
  let src2tt: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(transcriptTypes)) {
    const kvid = Number(key);
    for (let sourceID of value.sources.map(Number)) {
      if (!src2tt.hasOwnProperty(sourceID)) {
        src2tt[sourceID] = [];
      }
      src2tt[sourceID].push(kvid);
    }
  }
  return src2tt;
};

const transformResponse = (response: GlobalDataResponse) => {
  response['org2ass'] = createAssemblyMap(response.assemblies);
  response['ass2src'] = createSourceMap(response.sources);
  response['src2attr'] = createAttrMap(response.attributes);
  response['src2gt'] = createGeneTypeMap(response.gene_types);
  response['src2tt'] = createTranscriptTypeMap(response.transcript_types);
  return response;
};

export const databaseApi = createApi({
  reducerPath: 'databaseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/main',
    credentials: 'same-origin',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
  }),
  endpoints: (builder) => ({
    getGlobalData: builder.query<GlobalDataResponse, void>({
      query: () => '/globalData',
      transformResponse,
    }),
  }),
});

export const { useGetGlobalDataQuery } = databaseApi;