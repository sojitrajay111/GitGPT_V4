// features/projectMetricsApiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export const projectMetricsApiSlice = createApi({
  reducerPath: "projectMetricsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["ProjectMetrics"],
  endpoints: (builder) => ({
    // Query to get all project metrics
    getProjectMetrics: builder.query({
      query: (projectId) => `/metrics/${projectId}`,
      providesTags: (result, error, projectId) => [
        { type: "ProjectMetrics", id: projectId },
      ],
    }),
  }),
});

export const { useGetProjectMetricsQuery } = projectMetricsApiSlice;
