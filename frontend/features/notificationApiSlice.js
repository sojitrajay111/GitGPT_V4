// features/notificationApiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Assuming your base API URL is defined in a config or environment variable
// For example: process.env.NEXT_PUBLIC_API_BASE_URL
 // Adjust as per your backend URL

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
    // Prepare headers to include authorization token (e.g., Bearer token)
    prepareHeaders: (headers, { getState }) => {
      // Try Redux state first, then fallback to localStorage
      let token = getState().auth?.token;
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notifications'], // Define tag types for invalidation
  endpoints: (builder) => ({
    // Query to get all notifications for a specific user
    getNotifications: builder.query({
      query: (userId) => `/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Notifications', id: _id })), 'Notifications']
          : ['Notifications'],
    }),
    // Mutation to mark a notification as read
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/${notificationId}/read`,
        method: 'PUT',
      }),
      // Invalidate the 'Notifications' tag to refetch the list after a notification is marked read
      // This will ensure the UI updates to reflect the change
      invalidatesTags: (result, error, notificationId) => [{ type: 'Notifications', id: notificationId }],
    }),
    // You might add other mutations later, e.g., deleteNotification, createNotification (if triggered by frontend)
    sendUserStoryAssignmentNotification: builder.mutation({
      query: ({ collaboratorIds, userStoryTitle, projectId, projectName }) => ({
        url: `/user-story-assignment`,
        method: 'POST',
        body: { collaboratorIds, userStoryTitle, projectId, projectName },
      }),
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: 'Notifications', id: notificationId },
        'Notifications',
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useSendUserStoryAssignmentNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi;

// Export the reducer for your store setup
export default notificationApi.reducer;
