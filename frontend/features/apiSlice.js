// features/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api', // Optional but good practice
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // All endpoints will be prefixed with /api
  }),
  endpoints: () => ({}), // Empty, will be extended later
});
