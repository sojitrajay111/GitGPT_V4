import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userProfileApiSlice = createApi({
  reducerPath: "userProfileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    credentials: "include",
  }),
  tagTypes: ["UserProfile"],
  endpoints: (builder) => ({
    // Update user profile
    updateUserProfile: builder.mutation({
      query: ({ userId, username }) => ({
        url: `/users/update-profile/${userId}`,
        method: "PUT",
        body: { username },
      }),
      invalidatesTags: ["UserProfile"],
    }),
    // Update user password
    updateUserPassword: builder.mutation({
      query: ({ userId, currentPassword, newPassword }) => ({
        url: `/users/update-password`,
        method: "POST",
        body: { userId, currentPassword, newPassword },
      }),
    }),
    // Forgot password
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const {
  useUpdateUserProfileMutation,
  useUpdateUserPasswordMutation,
  useForgotPasswordMutation,
} = userProfileApiSlice; 