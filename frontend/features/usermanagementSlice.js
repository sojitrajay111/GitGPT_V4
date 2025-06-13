import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userManagementApi = createApi({
  reducerPath: 'userManagementApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-management`, // Assuming your backend user API is at /api/users
    credentials: 'include',
  }),
  tagTypes: ['User'], // Define a tag type for caching and invalidation
  endpoints: (builder) => ({
    // Endpoint to check if a user with a given username exists
    checkUserExistence: builder.mutation({
      query: (username) => ({ // Now accepting username
        url: '/check-existence',
        method: 'POST',
        body: { username }, // Send username in the body
      }),
    }),
    // Endpoint to add a new user and trigger invitation email
    // Now expects an object { userData, managerId }
    addUser: builder.mutation({
      query: ({ userData, managerId }) => ({
        url: `/${managerId}/add-user`, // POST to /api/users/:managerId/add-user
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'], // Invalidate 'User' tag to refetch users after adding
    }),
    // Endpoint to get all users managed by a specific manager
    // Now accepts managerId as a parameter
    getUsers: builder.query({
      query: (managerId) => `/${managerId}/developers`, // GET from /api/users/:managerId/developers
      providesTags: ['User'], // Provide 'User' tag to enable caching and invalidation
    }),
    // Endpoint to update a user
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`, // PUT to /api/users/:id`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['User'],
    }),
    // Endpoint to delete a user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/${id}`, // DELETE to /api/users/:id
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    // NEW: Endpoint for resetting password
    resetPassword: builder.mutation({
      query: (credentials) => ({
        url: '/auth/reset-password', // POST to /api/auth/reset-password
        method: 'POST',
        body: credentials, // Contains { token, newPassword }
      }),
      // No invalidation needed as it doesn't directly affect the 'User' list display
    }),
  }),
});

export const {
  useCheckUserExistenceMutation,
  useAddUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation, // NEW: Export the reset password hook
} = userManagementApi;