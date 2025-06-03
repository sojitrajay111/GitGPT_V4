// features/codeAnalysisApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const codeAnalysisApiSlice = createApi({
  reducerPath: "codeAnalysisApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://gitgpt-v2.onrender.com/api/code-analysis", // Base URL for code analysis APIs
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["CodeAnalysisSession", "CodeAnalysisMessage"],
  endpoints: (builder) => ({
    // Start a new code analysis session
    startCodeAnalysisSession: builder.mutation({
      query: (sessionData) => ({
        url: "/sessions",
        method: "POST",
        body: sessionData,
      }),
      invalidatesTags: ["CodeAnalysisSession"],
    }),

    // Get all code analysis sessions for a project
    getCodeAnalysisSessions: builder.query({
      query: (projectId) => `/sessions/${projectId}`,
      providesTags: ["CodeAnalysisSession"],
    }),

    // Get messages for a specific code analysis session
    getCodeAnalysisMessages: builder.query({
      query: (sessionId) => `/sessions/${sessionId}/messages`,
      providesTags: (result, error, sessionId) => [
        { type: "CodeAnalysisMessage", id: sessionId },
      ],
    }),

    // Send a message to the AI and save it
    sendCodeAnalysisMessage: builder.mutation({
      query: ({ sessionId, text, currentBranchCodeContext }) => ({
        url: `/sessions/${sessionId}/messages`,
        method: "POST",
        body: { text, currentBranchCodeContext },
      }),
      invalidatesTags: (result, error, { sessionId }) => [
        { type: "CodeAnalysisMessage", id: sessionId },
        "CodeAnalysisSession", // Invalidate sessions to update lastActivity/title
      ],
    }),

    // Push generated code to a new branch and create a Pull Request
    pushCodeAndCreatePR: builder.mutation({
      query: (data) => ({
        url: "/push-pr",
        method: "POST",
        body: data,
      }),
      // No specific invalidation needed here, as it's a one-off action
      // and the UI will update based on the returned PR URL.
    }),
  }),
});

export const {
  useStartCodeAnalysisSessionMutation,
  useGetCodeAnalysisSessionsQuery,
  useGetCodeAnalysisMessagesQuery,
  useSendCodeAnalysisMessageMutation,
  usePushCodeAndCreatePRMutation,
} = codeAnalysisApiSlice;
