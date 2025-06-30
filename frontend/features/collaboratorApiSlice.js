import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const collaboratorApi = createApi({
  reducerPath: 'collaboratorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    addCollaborator: builder.mutation({
      query: (body) => ({
        url: "/collaborators/add",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useAddCollaboratorMutation } = collaboratorApi;
export default collaboratorApi.reducer; 