import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Create a base query that will inject the token into the headers
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`, // Explicit base URL
  credentials: "include", // Still include credentials for cookies if any
  prepareHeaders: (headers, { getState }) => {
    // Retrieve the token from local storage using the key 'token'
    const token = localStorage.getItem("token"); // Corrected: Using 'token' as per your githubApiSlice.js

    // If a token exists, set the Authorization header
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const userStoryApiSlice = createApi({
  reducerPath: "userStoryApi", // Unique reducer path for this slice
  baseQuery: baseQueryWithAuth, // Use the custom base query with auth headers
  tagTypes: ["UserStory"], // Specific tag type for user stories
  endpoints: (builder) => ({
    // Endpoint to get all user stories for a project
    getUserStories: builder.query({
      query: (projectId) => `/user-stories/${projectId}`,
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.userStories.map(({ _id }) => ({
                type: "UserStory",
                id: _id,
              })),
              { type: "UserStory", id: "LIST" },
            ]
          : [{ type: "UserStory", id: "LIST" }],
    }),
    // Endpoint to create a new user story
    createUserStory: builder.mutation({
      query: (data) => ({
        url: "/user-stories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "UserStory", id: "LIST" }],
    }),
    generateAiStory: builder.mutation({
      query: (data) => ({
        url: "/user-stories/generate-ai-story",
        method: "POST",
        body: data, // { userStoryTitle, description, acceptanceCriteria, testingScenarios }
      }),
      // No invalidation needed here as it doesn't change existing user stories directly,
      // it just provides content to be used in the create/update flow.
    }),
  }),
});

export const {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useGenerateAiStoryMutation,
} = userStoryApiSlice;
