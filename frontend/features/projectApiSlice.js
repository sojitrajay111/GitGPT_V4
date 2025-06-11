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

  tagTypes: ["Project", "GitHubRepos", "GitHubStatus", "ProjectCollaborators"],

  // Define the API endpoints
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: (userId) => `/projects/user/${userId}`,
      providesTags: ["Project"],
    }),

    getDeveloperProjects: builder.query({
      query: (userId) => `/developer/${userId}/projects`,
      providesTags: ["Project"],
    }),

    createProject: builder.mutation({
      query: (projectData) => ({
        url: "/projects",
        method: "POST",
        body: projectData,
      }),
      invalidatesTags: ["Project", "GitHubRepos"],
    }),

    getUserGithubRepos: builder.query({
      query: () => "/github/repos",
      providesTags: ["GitHubRepos"],
    }),

    getGitHubAuthStatus: builder.query({
      query: () => "/github/status",
      providesTags: ["GitHubStatus"],
    }),

    getProjectById: builder.query({
      query: (projectId) => `projects/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "Project", id: projectId },
      ],
    }),

    getCollaborators: builder.query({
      query: (projectId) => `projects/${projectId}/collaborators`,
      providesTags: (result, error, projectId) => [
        { type: "ProjectCollaborators", id: projectId },
      ],
    }),

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

    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: `/projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
  }),
});

// Export the generated hooks for each endpoint for use in React components
export const {
  useGetProjectsQuery,
  useGetDeveloperProjectsQuery,
  useCreateProjectMutation,
  useGetUserGithubReposQuery,
  useGetGitHubAuthStatusQuery,
  useGetProjectByIdQuery,
  useGetCollaboratorsQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApiSlice;
