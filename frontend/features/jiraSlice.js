import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const jiraApi = createApi({
  reducerPath: 'jiraApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jira`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Jira'],
  endpoints: (builder) => ({
    // This verifyJira mutation is typically called internally by addJiraDetails on the backend.
    // Frontend generally wouldn't call this directly for verification if addJiraDetails handles it.
    verifyJira: builder.mutation({
      query: (credentials) => ({
        url: '/verify', // This route is not directly used from frontend in this setup
        method: 'POST',
        body: credentials,
      }),
    }),
    // Endpoint to add or update Jira details, now accepting userId
    addJiraDetails: builder.mutation({
      query: ({ userId, jiraUrl, jiraEmail, jiraToken }) => ({ // Deconstruct to ensure userId is passed
        url: `/add`, // Route remains /add, userId sent in body
        method: 'POST',
        body: { userId, jiraUrl, jiraEmail, jiraToken }, // Send userId in the body
      }),
      invalidatesTags: ['Jira'],
    }),
    // Endpoint to get Jira details for a specific user, now accepting userId
    getJiraDetails: builder.query({
      query: (userId) => `/details/${userId}`, // Pass userId as a URL parameter
      providesTags: ['Jira'],
    }),
    // Endpoint to delete Jira details for a specific user, now accepting userId
    deleteJiraDetails: builder.mutation({
      query: (userId) => ({ // Accept userId as argument
        url: `/delete/${userId}`, // Pass userId as a URL parameter
        method: 'DELETE',
      }),
      invalidatesTags: ['Jira'],
    }),
  }),
});

// Export the generated hooks
export const {
  useVerifyJiraMutation,
  useAddJiraDetailsMutation,
  useGetJiraDetailsQuery,
  useDeleteJiraDetailsMutation
} = jiraApi;
