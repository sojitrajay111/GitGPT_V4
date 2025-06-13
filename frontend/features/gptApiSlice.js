import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const gptApiSlice = createApi({
  reducerPath: 'gptApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // If we have a token, set it in the Authorization header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['GPT'],
  endpoints: (builder) => ({
    verifyGptKey: builder.mutation({
      query: (data) => ({
        url: '/gpt/verify',
        method: 'POST',
        body: data,
      }),
    }),
    addGptDetails: builder.mutation({
      query: (data) => ({
        url: '/gpt',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GPT'],
    }),
    getGptDetails: builder.query({
      query: () => '/gpt',
      providesTags: ['GPT'],
    }),
    deleteGptDetails: builder.mutation({
      query: (id) => ({
        url: `/gpt/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GPT'],
    }),
  }),
});

export const {
  useVerifyGptKeyMutation,
  useAddGptDetailsMutation,
  useGetGptDetailsQuery,
  useDeleteGptDetailsMutation,
} = gptApiSlice; 