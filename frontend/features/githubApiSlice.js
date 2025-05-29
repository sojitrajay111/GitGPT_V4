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
  tagTypes: ["GitHubData", "GitHubStatus", "ProjectCollaborators"], // Added ProjectCollaborators tagType
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
      // Corrected: Destructure 'permissions' from the query arguments
      query: ({ projectId, githubUsername, permissions }) => ({
        url: "/collaborators",
        method: "POST",
        body: { projectId, githubUsername, permissions }, // Now 'permissions' is correctly defined
      }),
      // Invalidate ProjectCollaborators tag to refetch the list after adding/updating
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectCollaborators", id: projectId }, // Invalidate for the specific project
      ],
    }),
    // New endpoint to get collaborators for a project
    getCollaborators: builder.query({
      query: (projectId) => `/projects/${projectId}/collaborators`,
      providesTags: (result, error, projectId) => [
        { type: "ProjectCollaborators", id: projectId },
      ],
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
  useGetCollaboratorsQuery, // Export the new hook
} = githubApiSlice;
