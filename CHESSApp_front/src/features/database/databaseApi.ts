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
      query: () => `/globalData`,
      transformResponse: (response: object) => {
        // useful in case we need to do anything to the response before caching it
        return response;
      },
    }),
  }),
});

export const { useGetGlobalDataQuery } = databaseApi;