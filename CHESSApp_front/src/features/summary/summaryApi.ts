import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const summaryApi = createApi({
  reducerPath: 'summaryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/main',
    credentials: "same-origin",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  }),
  endpoints: (builder) => ({
    getTxSummarySlice: builder.query<object, void>({
      query: (settings) => {
        console.log("settings: ", settings)
        return {
          url: '/txSummarySlice',
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

export const { useGetTxSummarySliceQuery } = summaryApi;