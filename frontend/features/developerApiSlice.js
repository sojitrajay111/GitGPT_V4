import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const developerApiSlice = createApi({
  reducerPath: "developerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://gitgpt-v2.onrender.com/api/developer",
    credentials: "include",
  }),
  tagTypes: ["developer"],
  endpoints: (builder) => ({
    getDeveloperProjects: builder.query({
      query: (userId) => `projects/${userId}`, // Defines the URL path for the request
    }),
    getCollaboratorPermissions: builder.query({
      query: ({ projectId, githubId }) =>
        `projects/${projectId}/collaborators/${githubId}/permissions`,
    }),
    getDeveloperUserStories: builder.query({
      query: (githubId) => `userstories/${githubId}`,
    }),
  }),
});

export const {
  useGetDeveloperProjectsQuery,
  useGetCollaboratorPermissionsQuery,
  useGetDeveloperUserStoriesQuery,
} = developerApiSlice;
