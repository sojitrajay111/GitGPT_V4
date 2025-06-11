// features/githubApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const githubApiSlice = createApi({
  reducerPath: "githubApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token"); // Or however you store your auth token
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
    "GitHubRepo",
    "GitHubBranches",
    "GitHubPullRequests",
    "UserAndGitHubData",
    "Project",
  ],

  endpoints: (builder) => ({
    getGitHubStatus: builder.query({
      query: () => "/status",
      providesTags: ["GitHubStatus"],
    }),

    authenticateGitHub: builder.mutation({
      query: (credentials) => ({
        url: "/authenticate",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["GitHubStatus", "GitHubData"],
    }),

    disconnectGitHub: builder.mutation({
      query: () => ({
        url: "/disconnect",
        method: "DELETE",
      }),
      invalidatesTags: ["GitHubStatus", "GitHubData"],
    }),

    checkGitHubAuthStatus: builder.query({
      query: () => "/auth-status",
      providesTags: ["GitHubStatus"],
    }),

    getGitHubData: builder.query({
      query: () => "/data",
      providesTags: ["GitHubData"],
    }),

    searchGithubUsers: builder.query({
      query: (searchTerm) => `/search/users?q=${searchTerm}`,
      providesTags: (result, error, searchTerm) => [
        { type: "GitHubUsers", id: searchTerm },
      ],
    }),

    addCollaborator: builder.mutation({
      query: ({ projectId, githubUsername, permissions }) => ({
        url: "/collaborators",
        method: "POST",
        body: { projectId, githubUsername, permissions },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectCollaborators", id: projectId },
      ],
    }),

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
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectCollaborators", id: projectId },
      ],
    }),

    updateCollaboratorPermissions: builder.mutation({
      query: ({ projectId, githubUsername, permissions }) => ({
        url: `collaborators/${projectId}/${githubUsername}/permissions`,
        method: "PUT",
        body: { permissions },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectCollaborators", id: projectId },
      ],
    }),

    getGitHubRepoBranches: builder.query({
      query: ({ owner, repo }) => `/repos/${owner}/${repo}/branches`,
      providesTags: (result, error, { owner, repo }) => [
        { type: "GitHubBranches", id: `${owner}/${repo}` },
      ],
      transformResponse: (response, meta, arg) => {
        if (response && response.success && Array.isArray(response.branches)) {
          return response;
        }
        if (Array.isArray(response)) {
          return { success: true, branches: response };
        }
        return { success: false, branches: [] };
      },
    }),

    createGitHubBranch: builder.mutation({
      query: ({ owner, repo, newBranchName, baseBranch }) => ({
        url: `/repos/${owner}/${repo}/branches`,
        method: "POST",
        body: { newBranchName, baseBranch },
      }),
      invalidatesTags: (result, error, { owner, repo }) => [
        { type: "GitHubBranches", id: `${owner}/${repo}` },
      ],
    }),

    deleteGitHubBranch: builder.mutation({
      query: ({ owner, repo, branchName }) => ({
        url: `/repos/${owner}/${repo}/branches/${branchName}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { owner, repo }) => [
        { type: "GitHubBranches", id: `${owner}/${repo}` },
      ],
    }),

    getPullRequests: builder.query({
      query: ({ owner, repo, state = "all", per_page = 30, page = 1 }) =>
        `/repos/${owner}/${repo}/pulls?state=${state}&per_page=${per_page}&page=${page}`,
      providesTags: (result, error, { owner, repo, state }) => [
        { type: "GitHubPullRequests", id: `${owner}/${repo}/${state}` },
      ],
      transformResponse: (response, meta, arg) => {
        if (
          response &&
          response.success &&
          Array.isArray(response.pullRequests)
        ) {
          return response.pullRequests;
        }
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
    }),

    createPullRequest: builder.mutation({
      query: ({ owner, repo, title, body, head, base, reviewers }) => ({
        url: `/repos/${owner}/${repo}/pulls`,
        method: "POST",
        body: { title, body, head, base, reviewers },
      }),
      invalidatesTags: (result, error, { owner, repo }) => [
        { type: "GitHubPullRequests", id: `${owner}/${repo}/open` },
        { type: "GitHubPullRequests", id: `${owner}/${repo}/all` },
      ],
    }),

    updatePullRequest: builder.mutation({
      query: ({ owner, repo, pullNumber, ...patchData }) => ({
        url: `/repos/${owner}/${repo}/pulls/${pullNumber}`,
        method: "PATCH",
        body: patchData,
      }),
      invalidatesTags: (result, error, { owner, repo, pullNumber }) => [
        { type: "GitHubPullRequests", id: `${owner}/${repo}/open` },
        { type: "GitHubPullRequests", id: `${owner}/${repo}/closed` },
        { type: "GitHubPullRequests", id: `${owner}/${repo}/all` },
      ],
    }),

    getUserAndGithubData: builder.query({
      query: (userId) => `/user-and-github-data/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "UserAndGitHubData", id: userId },
        "GitHubStatus",
        "GitHubData",
      ],
    }),

    updateUserProfile: builder.mutation({
      query: ({ userId, ...profileData }) => ({
        url: `users/${userId}`,
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "UserAndGitHubData", id: userId },
      ],
    }),

    deleteGithubRepo: builder.mutation({
      query: ({ owner, repo }) => ({
        url: `/repos/${owner}/${repo}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GitHubRepo", "Project"],
    }),
  }),
});

export const {
  useGetGitHubStatusQuery,
  useAuthenticateGitHubMutation,
  useDisconnectGitHubMutation,
  useCheckGitHubAuthStatusQuery,
  useGetGitHubDataQuery,
  useSearchGithubUsersQuery,
  useAddCollaboratorMutation,
  useGetCollaboratorsQuery,
  useDeleteCollaboratorMutation,
  useUpdateCollaboratorPermissionsMutation,
  useGetGitHubRepoBranchesQuery,
  useCreateGitHubBranchMutation,
  useDeleteGitHubBranchMutation,
  useGetPullRequestsQuery,
  useCreatePullRequestMutation,
  useUpdatePullRequestMutation,
  useGetUserAndGithubDataQuery,
  useUpdateUserProfileMutation,
  useDeleteGithubRepoMutation,
} = githubApiSlice;
