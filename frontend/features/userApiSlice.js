// features/userApiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    updateUser: builder.mutation({
      query: (userData) => ({
        url: `/user/${userData.id}`,
        method: 'PUT',
        body: userData,
      }),
    }),
  }),
});

export const { useUpdateUserMutation } = userApi;
