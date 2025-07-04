// features/projectApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the API slice for project-related operations
export const projectApiSlice = createApi({
  reducerPath: "projectApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token"); // Get the token from local storage
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers; // Return the modified headers
    },
  }),

  tagTypes: ["Project", "GitHubRepos", "GitHubStatus", "ProjectCollaborators", "ProjectReport"],
  // "GitHubRepos" added because project creation can affect GitHub state

  // Define the API endpoints
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: (userId) => `/projects/user/${userId}`, // Endpoint path for fetching projects by user ID (currently used for manager)
      providesTags: ["Project"], // Tag this query's data
    }),
    // --- ADD THIS NEW ENDPOINT FOR DEVELOPER PROJECTS ---
    getDeveloperProjects: builder.query({
      query: (userId) => `/projects/developer/${userId}`, // **IMPORTANT: Define the correct backend path for developer projects**
      providesTags: ["Project"], // Tag this query's data (or a specific 'DeveloperProject' tag if needed)
    }),
    // --- END OF NEW ENDPOINT ---

    createProject: builder.mutation({
      query: (projectData) => ({
        url: "/projects", // Endpoint path for creating a project
        method: "POST", // HTTP method for creation
        body: projectData, // Request body containing project data
      }),
      invalidatesTags: ["Project", "GitHubRepos"], // Invalidate tags to trigger refetching
    }),

    getUserGithubRepos: builder.query({
      query: () => "/github/repos", // Endpoint path for fetching user's GitHub repos
      providesTags: ["GitHubRepos"], // Tag this query's data
    }),

    getGitHubAuthStatus: builder.query({
      query: () => "/github/status", // Endpoint path for GitHub authentication status
      providesTags: ["GitHubStatus"], // Tag this query's data
    }),
    getProjectById: builder.query({
      // New endpoint
      query: (projectId) => `projects/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "Project", id: projectId },
      ],
    }),
    getCollaborators: builder.query({
      // New endpoint
      query: (projectId) => `projects/${projectId}/collaborators`,
      providesTags: (result, error, projectId) => [
        { type: "ProjectCollaborators", id: projectId },
      ],
    }),
    // New: Mutation for updating a project
    updateProject: builder.mutation({
      query: ({ projectId, projectName, projectDescription }) => ({
        url: `/projects/${projectId}`,
        method: "PUT",
        body: { projectName, projectDescription },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "Project", id: projectId },
      ],
    }),
    // New: Mutation for deleting a project
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"], // Invalidate the general 'Project' tag to refetch project lists
    }),
    getProjectReportData: builder.query({
      query: (projectId) => ({
        url: `/projects/${projectId}/report`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        console.log('Project Report API Raw Response:', response);
        return response.data; // Extract the actual data payload
      },
      transformErrorResponse: (response) => {
        console.error('Project Report Data Error:', response);
        return response;
      },
      providesTags: (result, error, projectId) => [{
        type: 'ProjectReport',
        id: projectId
      }],
    }),
    syncProject: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}/sync-contributions`,
        method: "POST",
      }),
      invalidatesTags: ["Project"],
    }),
    syncContributions: builder.mutation({
      query: ({ projectId, branchName }) => ({
        url: `/projects/${projectId}/sync-contributions`,
        method: "POST",
        body: { branchName },
      }),
    }),
  }),
});

// Export the generated hooks for each endpoint for use in React components
export const {
  useGetProjectsQuery,
  useGetDeveloperProjectsQuery, // <-- NOW THIS HOOK WILL BE GENERATED AND EXPORTED!
  useCreateProjectMutation,
  useGetUserGithubReposQuery,
  useGetGitHubAuthStatusQuery,
  useGetProjectByIdQuery,
  useGetCollaboratorsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectReportDataQuery,
  useSyncProjectMutation,
  useSyncContributionsMutation,
} = projectApiSlice;