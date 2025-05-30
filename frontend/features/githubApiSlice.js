// features/githubApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const githubApiSlice = createApi({
  reducerPath: "githubApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/api/github", // Adjust based on your API structure
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
   tagTypes: ["GitHubData", "GitHubStatus"],
  endpoints: (builder) => ({
    getGitHubStatus: builder.query({
      query: () => "/status",
      providesTags: ["GitHubStatus"],
    }),

    // Authenticate GitHub
    authenticateGitHub: builder.mutation({
      query: (credentials) => ({
        url: "/authenticate",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["GitHubStatus", "GitHubData"],
    }),

    // Disconnect GitHub
    disconnectGitHub: builder.mutation({
      query: () => ({
        url: "/disconnect",
        method: "DELETE",
      }),
      invalidatesTags: ["GitHubStatus", "GitHubData"],
    }),

    // Legacy endpoints (keep for backward compatibility if needed)
    checkGitHubAuthStatus: builder.query({
      query: () => "/auth-status",
      providesTags: ["GitHubStatus"],
    }),

    getGitHubData: builder.query({
      query: () => "/data",
      providesTags: ["GitHubData"],
    }),
  }),
});

export const {
  useGetGitHubStatusQuery,
  useAuthenticateGitHubMutation,
  useDisconnectGitHubMutation,
  useCheckGitHubAuthStatusQuery, // Legacy
  useGetGitHubDataQuery,
} = githubApiSlice;
