// features/themeApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const themeApi = createApi({
  reducerPath: "themeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/theme`,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token"); // Get the token from local storage
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers; // Return the modified headers
    },
  }),
  tagTypes: ["Theme"],
  endpoints: (builder) => ({
    // Query to get a user's theme preference
    getTheme: builder.query({
      query: (userId) => `/${userId}`,
      providesTags: (result, error, userId) => [{ type: "Theme", id: userId }],
    }),
    // Mutation to update a user's theme preference
    updateTheme: builder.mutation({
      query: ({ userId, theme }) => ({
        url: `/${userId}`,
        method: "PUT",
        body: { theme },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Theme", id: userId },
      ],
    }),
  }),
});

// Export the generated hooks
export const { useGetThemeQuery, useUpdateThemeMutation } = themeApi;
