// client/src/features/company/companyApi.js

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Replace with your backend API URL
const BASE_URL = "http://localhost:3001/api/"; // Assuming your backend runs on port 5000

export const companyApi = createApi({
  reducerPath: "companyApi", // Unique reducer path for this API slice
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Don't set Content-Type for FormData
      if (headers.get('Content-Type')?.includes('multipart/form-data')) {
        headers.delete('Content-Type');
      }
      return headers;
    },
  }),
  tagTypes: ["Company"], // Define a tag type for caching and invalidation
  endpoints: (builder) => ({
    // Endpoint to get company details by userId
    getCompanyDetails: builder.query({
      query: (userId) => `company/${userId}`,
      providesTags: (result, error, userId) => [
        { type: "Company", id: userId },
      ],
      // Transform response to only return the company object, or null if not found
      transformResponse: (response) => response.company || null,
    }),
    // Endpoint to add or update company details
    addOrUpdateCompanyDetails: builder.mutation({
      query: (formData) => ({
        url: `company/add-or-update/${formData.get('userId')}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "Company", id: userId },
      ],
    }),
  }),
});

// Export hooks for usage in functional components, which are auto-generated based on the defined endpoints
export const {
  useGetCompanyDetailsQuery,
  useAddOrUpdateCompanyDetailsMutation,
} = companyApi;
