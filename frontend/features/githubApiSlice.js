// features/githubApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Import from githubApiSlice, NOT userStoryApiSlice

export const githubApiSlice = createApi({
  reducerPath: "githubApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://gitgpt-v2.onrender.com/api/github", // Adjust based on your API structure
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: [
    "GitHubData",
    "GitHubStatus",
    "ProjectCollaborators",
    "GitHubBranches",
  ], // Added ProjectCollaborators tagType

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
    deleteCollaborator: builder.mutation({
      query: ({ projectId, githubUsername }) => ({
        url: `collaborators/${projectId}/${githubUsername}`,
        method: "DELETE",
      }),
    }),

    updateCollaboratorPermissions: builder.mutation({
      query: ({ projectId, githubUsername, permissions }) => ({
        url: `collaborators/${projectId}/${githubUsername}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
    }),
    createGitHubBranch: builder.mutation({
      query: ({ owner, repo, newBranchName, baseBranch }) => ({
        url: `/repos/${owner}/${repo}/branches`,
        method: "POST",
        body: { newBranchName, baseBranch },
      }),
      invalidatesTags: (result, error, { owner, repo }) => [
        { type: "GitHubBranches", id: `${owner}/${repo}` }, // Invalidate branches for this repo
      ],
    }),
    // New endpoint for fetching repository branches
    getGitHubRepoBranches: builder.query({
      query: ({ owner, repo }) => `/repos/${owner}/${repo}/branches`,
      providesTags: (result, error, { owner, repo }) => [
        { type: "GitHubBranches", id: `${owner}/${repo}` },
      ],
    }),
    getUserAndGithubData: builder.query({
      query: (userId) => `/user-and-github-data/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "UserAndGitHubData", id: userId },
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
  useDeleteCollaboratorMutation,
  useUpdateCollaboratorPermissionsMutation,
  useCreateGitHubBranchMutation,
  useGetGitHubRepoBranchesQuery,
  useGetUserAndGithubDataQuery,
} = githubApiSlice;
