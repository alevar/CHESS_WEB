import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define interfaces for response data
interface Assembly {
  organism_id: number;
}

interface Source {
  assembly_id: number;
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
  let assembly_map: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(assemblies)) {
    const organism_id = Number(value.organism_id);
    if (!assembly_map.hasOwnProperty(organism_id)) {
      assembly_map[organism_id] = [];
    }
    assembly_map[organism_id].push(Number(key));
  }
  return assembly_map;
};

const createSourceMap = (sources: Record<string, Source>) => {
  let source_map: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(sources)) {
    const source_id = Number(key);
    const assembly_id = Number(value.assembly_id);
    if (!source_map.hasOwnProperty(assembly_id)) {
      source_map[assembly_id] = [];
    }
    source_map[assembly_id].push(source_id);
  }
  return source_map;
};

const createAttrMap = (attributes: Record<string, Attribute>) => {
  let src2attr: { [key: number]: { [key: string]: number[] } } = {};
  for (let [key, value] of Object.entries(attributes)) {
    const kvid = Number(key);
    for (let source_id of value.sources.map(Number)) {
      if (!src2attr.hasOwnProperty(source_id)) {
        src2attr[source_id] = {};
      }
      if (!src2attr[source_id].hasOwnProperty(value.key)) {
        src2attr[source_id][value.key] = [];
      }
      src2attr[source_id][value.key].push(kvid);
    }
  }
  return src2attr;
};

const createGeneTypeMap = (gene_types: Record<string, GeneType>) => {
  let src2gt: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(gene_types)) {
    const kvid = Number(key);
    for (let source_id of value.sources.map(Number)) {
      if (!src2gt.hasOwnProperty(source_id)) {
        src2gt[source_id] = [];
      }
      src2gt[source_id].push(kvid);
    }
  }
  return src2gt;
};

const createTranscriptTypeMap = (transcript_types: Record<string, TranscriptType>) => {
  let src2tt: { [key: number]: number[] } = {};
  for (let [key, value] of Object.entries(transcript_types)) {
    const kvid = Number(key);
    for (let source_id of value.sources.map(Number)) {
      if (!src2tt.hasOwnProperty(source_id)) {
        src2tt[source_id] = [];
      }
      src2tt[source_id].push(kvid);
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