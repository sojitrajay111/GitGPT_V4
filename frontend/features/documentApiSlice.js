import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: fetchBaseQuery({

    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents`, // Ensure this matches your backend

    prepareHeaders: (headers, { getState }) => {
      // getState can be useful
      const token = localStorage.getItem("token"); // Or get from Redux state
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      // For FormData, 'Content-Type' is set by the browser, so don't set it manually here
      // unless you are NOT sending FormData and need 'application/json'.
      return headers;
    },
  }),
  tagTypes: ["Document"], // Tag for caching and invalidation
  endpoints: (builder) => ({
    getProjectDocuments: builder.query({
      query: (projectId) => `/project/${projectId}`,
      providesTags: (result, error, projectId) =>
        result && result.documents // Check if result and result.documents exist
          ? [
              ...result.documents.map(({ _id }) => ({
                type: "Document",
                id: _id,
              })),
              { type: "Document", id: "LIST" }, // General list tag
            ]
          : [{ type: "Document", id: "LIST" }], // Fallback if no documents
    }),
    uploadDocument: builder.mutation({
      query: ({
        documentTitle,
        documentShortDescription,
        projectId,
        documentFile,
      }) => {
        const formData = new FormData();
        formData.append("documentTitle", documentTitle);
        formData.append("documentShortDescription", documentShortDescription);
        formData.append("projectId", projectId);
        formData.append("documentFile", documentFile); // This is the file object

        return {
          url: "/upload",
          method: "POST",
          body: formData,
          // formData: true, // Some RTK Query versions might use this hint, but usually automatic
        };
      },
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),
    saveGeneratedDocument: builder.mutation({
      query: (documentData) => ({
        url: "/generate",
        method: "POST",
        body: documentData, // Sent as JSON
      }),
      invalidatesTags: [{ type: "Document", id: "LIST" }],
    }),
    updateDocument: builder.mutation({
      query: ({
        documentId,
        documentTitle,
        documentShortDescription,
        documentFile,
      }) => {
        const formData = new FormData();
        // Append fields only if they are provided, to allow partial updates
        if (documentTitle) formData.append("documentTitle", documentTitle);
        if (documentShortDescription)
          formData.append("documentShortDescription", documentShortDescription);
        if (documentFile) formData.append("documentFile", documentFile); // New file if provided

        return {
          url: `/${documentId}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { documentId }) => [
        { type: "Document", id: documentId }, // Invalidate specific document
        { type: "Document", id: "LIST" }, // And the list
      ],
    }),
    deleteDocument: builder.mutation({
      query: (documentId) => ({
        url: `/${documentId}`,
        method: "DELETE",
      }),
      // Optimistic update: remove from cache immediately
      // onQueryStarted: async (documentId, { dispatch, queryFulfilled }) => {
      //   const patchResult = dispatch(
      //     documentApi.util.updateQueryData('getProjectDocuments', projectId, (draft) => {
      //       // Assuming you have projectId available or can pass it
      //       // This part is tricky without projectId directly here.
      //       // A simpler invalidation is often sufficient.
      //     })
      //   );
      //   try {
      //     await queryFulfilled;
      //   } catch {
      //     patchResult.undo();
      //   }
      // },
      invalidatesTags: (result, error, documentId) => [
        { type: "Document", id: documentId },
        { type: "Document", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProjectDocumentsQuery,
  useUploadDocumentMutation,
  useSaveGeneratedDocumentMutation,
  useUpdateDocumentMutation, // Export new hook
  useDeleteDocumentMutation, // Export new hook
} = documentApi;
