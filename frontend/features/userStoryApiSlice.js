import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Create a base query that will inject the token into the headers
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const userStoryApiSlice = createApi({
  reducerPath: "userStoryApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["UserStory"],
  endpoints: (builder) => ({
    // Query to get all user stories for a project
    getUserStories: builder.query({
      query: (projectId) => `/user-stories/${projectId}`,
      providesTags: (result) =>
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

    // Mutation to create a new user story
    createUserStory: builder.mutation({
      query: (data) => ({
        url: "/user-stories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "UserStory", id: "LIST" }],
    }),

    // Mutation to update a user story
    updateUserStory: builder.mutation({
      query: ({ userStoryId, ...data }) => ({
        url: `/user-stories/${userStoryId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { userStoryId }) => [
        { type: "UserStory", id: userStoryId },
        { type: "UserStory", id: "LIST" },
      ],
    }),

    // Mutation to delete a user story
    deleteUserStory: builder.mutation({
      query: (userStoryId) => ({
        url: `/user-stories/${userStoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userStoryId) => [
        { type: "UserStory", id: userStoryId },
        { type: "UserStory", id: "LIST" },
      ],
    }),

    // Mutation for AI content generation
    generateAiStory: builder.mutation({
      query: (data) => ({
        url: "/user-stories/generate-ai-story",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetUserStoriesQuery,
  useCreateUserStoryMutation,
  useUpdateUserStoryMutation, // Export new hook
  useDeleteUserStoryMutation, // Export new hook
  useGenerateAiStoryMutation,
} = userStoryApiSlice;
