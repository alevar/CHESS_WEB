import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const genesApi = createApi({
  reducerPath: 'genesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/main',
    credentials: "same-origin",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  }),
  endpoints: (builder) => ({
    getGenesSlice: builder.query<object, void>({
      query: (settings) => {
        return {
          url: '/genesSlice',
          method: 'POST',
          body: settings,
        };
      },
      transformResponse: (response: object) => {
        return response;
      },
    }),
  }),
});

export const { useGetGenesSliceQuery } = genesApi;