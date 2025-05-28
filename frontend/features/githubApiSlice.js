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
  tagTypes: ["GitHubData"],
  endpoints: (builder) => ({
    authenticateGitHub: builder.mutation({
      query: (credentials) => ({
        url: "/authenticate",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["GitHubData"],
    }),
    getGitHubData: builder.query({
      query: () => "/data",
      providesTags: ["GitHubData"],
    }),
    checkGitHubAuthStatus: builder.query({
      query: () => "/auth-status",
      providesTags: ["GitHubData"],
    }),
  }),
});

export const {
  useAuthenticateGitHubMutation,
  useGetGitHubDataQuery,
  useCheckGitHubAuthStatusQuery,
} = githubApiSlice;