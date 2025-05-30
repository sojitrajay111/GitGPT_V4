import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: fetchBaseQuery({
    // Set the base URL to match your backend API endpoint for documents
    baseUrl: "http://localhost:3001/api/documents",
    prepareHeaders: (headers) => {
      // Retrieve the authentication token from localStorage, similar to githubApiSlice
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Define tag types for caching and invalidation
  tagTypes: ["Document"],
  endpoints: (builder) => ({
    // Query to get all documents for a specific project
    getProjectDocuments: builder.query({
      query: (projectId) => `/project/${projectId}`,
      // Provides tags for caching. When documents are added/updated, this query will be re-fetched.
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.documents.map(({ _id }) => ({
                type: "Document",
                id: _id,
              })),
              { type: "Document", id: "LIST" }, // A tag for the list of documents
            ]
          : [{ type: "Document", id: "LIST" }],
    }),
    // Mutation to upload a new document file
    uploadDocument: builder.mutation({
      query: ({
        documentTitle,
        documentShortDescription,
        projectId,
        documentFile,
      }) => {
        // Create a FormData object to send both text fields and the file
        const formData = new FormData();
        formData.append("documentTitle", documentTitle);
        formData.append("documentShortDescription", documentShortDescription);
        formData.append("projectId", projectId);
        formData.append("documentFile", documentFile); // Append the actual file

        return {
          url: "/upload",
          method: "POST",
          body: formData,
          // When sending FormData, the 'Content-Type' header is automatically set to 'multipart/form-data'
          // by the browser, so you don't need to specify it here.
        };
      },
      // Invalidate the 'Document' tag to trigger a re-fetch of the document list
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),
    // Mutation to save a newly generated document (without a direct file upload)
    saveGeneratedDocument: builder.mutation({
      query: (documentData) => ({
        url: "/generate",
        method: "POST",
        body: documentData, // This will be sent as JSON
      }),
      // Invalidate the 'Document' tag to trigger a re-fetch of the document list
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),
  }),
});

// Export the auto-generated hooks for use in your React components
export const {
  useGetProjectDocumentsQuery,
  useUploadDocumentMutation,
  useSaveGeneratedDocumentMutation,
} = documentApi;
