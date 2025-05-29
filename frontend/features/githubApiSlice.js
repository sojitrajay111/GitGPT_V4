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
    searchGithubUsers: builder.query({
      // New endpoint
      query: (searchTerm) => `/search/users?q=${searchTerm}`,
      providesTags: (result, error, searchTerm) => [
        { type: "GitHubUsers", id: searchTerm },
      ],
    }),
    addCollaborator: builder.mutation({
      // New endpoint
      query: ({ projectId, githubUsername }) => ({
        url: "/collaborators",
        method: "POST",
        body: { projectId, githubUsername },
      }),
      invalidatesTags: ["ProjectCollaborators"], // Invalidate collaborators for the specific project
    }),
  }),
});

export const {
  useGetGitHubStatusQuery,
  useAuthenticateGitHubMutation,
  useDisconnectGitHubMutation,
  useCheckGitHubAuthStatusQuery, // Legacy
  useGetGitHubDataQuery,
  useSearchGithubUsersQuery,
  useAddCollaboratorMutation,
} = githubApiSlice;
