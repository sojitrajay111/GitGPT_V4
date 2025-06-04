// features/githubApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const githubApiSlice = createApi({
  reducerPath: "githubApi",
  baseQuery: fetchBaseQuery({

    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/github`, // Adjust based on your API structure

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
    "GitHubRepo", // General tag for repo specific data
    "GitHubBranches",
    "GitHubPullRequests",
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
        { type: "GitHubUsers", id: searchTerm }, // Consider a more general tag if not specific to search term
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
      // This should be in projectApiSlice based on your initial file structure
      // If it's here, ensure correct usage or move it.
      // Assuming it's correctly used from projectApiSlice on the page.
      query: (projectId) => `/projects/${projectId}/collaborators`, // Example path, adjust if needed
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

    // START: Endpoints for Branches and PRs
    getGitHubRepoBranches: builder.query({
      query: ({ owner, repo }) => `/repos/${owner}/${repo}/branches`,
      providesTags: (result, error, { owner, repo }) => [
        { type: "GitHubBranches", id: `${owner}/${repo}` },
      ],
      // GitHub API for branches returns an array of objects, each with 'name', 'commit' (obj with sha), 'protected'
      // If your backend doesn't transform it, it's fine. If it wraps it, use transformResponse.
      transformResponse: (response, meta, arg) => {
        if (response && response.success && Array.isArray(response.branches)) {
          return response; // If backend wraps: { success: true, branches: [...] }
        }
        if (Array.isArray(response)) {
          // If backend returns array of branches directly
          return { success: true, branches: response }; // Wrap for consistency if needed by frontend
        }
        return { success: false, branches: [] }; // Default error structure
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
        url: `/repos/${owner}/${repo}/branches/${branchName}`, // Ensure backend matches this
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
      // GitHub API returns an array of PR objects directly.
      // If your backend wraps it (e.g., in a `data` or `pullRequests` field), transform it.
      transformResponse: (response, meta, arg) => {
        if (
          response &&
          response.success &&
          Array.isArray(response.pullRequests)
        ) {
          return response.pullRequests; // If backend wraps: { success: true, pullRequests: [...] }
        }
        if (Array.isArray(response)) {
          // If backend returns array directly
          return response;
        }
        return []; // Default error structure
      },
    }),

    createPullRequest: builder.mutation({
      query: ({ owner, repo, title, body, head, base, reviewers }) => ({
        url: `/repos/${owner}/${repo}/pulls`,
        method: "POST",
        body: { title, body, head, base, reviewers },
      }),
      invalidatesTags: (result, error, { owner, repo }) => [
        { type: "GitHubPullRequests", id: `${owner}/${repo}/open` }, // Invalidate open PRs specifically
        { type: "GitHubPullRequests", id: `${owner}/${repo}/all` },
      ],
    }),

    updatePullRequest: builder.mutation({
      query: ({ owner, repo, pullNumber, ...patchData }) => ({
        // pullNumber is the PR number
        url: `/repos/${owner}/${repo}/pulls/${pullNumber}`,
        method: "PATCH",
        body: patchData, // e.g., { title, body } or { state: "closed" }
      }),
      invalidatesTags: (result, error, { owner, repo, pullNumber }) => [
        // Invalidate all PR lists for that repo as state might change
        { type: "GitHubPullRequests", id: `${owner}/${repo}/open` },
        { type: "GitHubPullRequests", id: `${owner}/${repo}/closed` },
        { type: "GitHubPullRequests", id: `${owner}/${repo}/all` },
      ],
    }),
    // END: Endpoints for Branches and PRs

    getUserAndGithubData: builder.query({
      query: (userId) => `/user-and-github-data/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "UserAndGitHubData", id: userId }, // More specific tag
        "GitHubStatus",
        "GitHubData", // Also provides these general tags if data is related
      ],
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
  useGetCollaboratorsQuery, // Ensure this is correctly used/defined
  useDeleteCollaboratorMutation,
  useUpdateCollaboratorPermissionsMutation,
  useGetGitHubRepoBranchesQuery,
  useCreateGitHubBranchMutation,
  useDeleteGitHubBranchMutation,
  useGetPullRequestsQuery,
  useCreatePullRequestMutation,
  useUpdatePullRequestMutation,
  useGetUserAndGithubDataQuery,
} = githubApiSlice;
