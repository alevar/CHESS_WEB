import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Sequence {
  id: number;
  name: string;
}

export const databaseApi = createApi({
  reducerPath: 'databaseApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/main',
                              credentials: "same-origin",
                              mode: "cors",
                              headers: { "Content-Type": "application/json" }}),
  endpoints: (builder) => ({
    getSequenceById: builder.query<Sequence, void>({
      query: (id) => `/assemblies`,
    }),
  }),
});

export const { useGetSequenceByIdQuery } = databaseApi;