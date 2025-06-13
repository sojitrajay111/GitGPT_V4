import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const configurationApiSlice = createApi({
  reducerPath: 'configurationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/configurations`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', Bearer `${token}`);
      }
      // Log headers for debugging
      console.log('Configuration API - Request headers:', {
        authorization: headers.get('authorization'),
        baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/configurations`
      });
      return headers;
    },
  }),
  tagTypes: ['Configuration'],
  endpoints: (builder) => ({
    // Get all configurations for a user
    getConfigurations: builder.query({
      query: ({ userId }) => {
        console.log('Configuration API - Fetching configurations for:', { userId });
        return `/${userId}`;
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('Configuration API - Error fetching configurations:', {
          response,
          meta,
          arg,
          status: response?.status,
          data: response?.data,
          message: response?.data?.message || response?.message || 'Unknown error'
        });
        return response;
      },
      providesTags: ['Configuration'],
    }),

    // Add or update a configuration
    addOrUpdateConfiguration: builder.mutation({
      query: ({ userId, configTitle, configValue }) => {
        console.log('Configuration API - Saving configuration:', {
          userId,
          configTitle,
          configValue
        });
        return {
          url: `/${userId}`,
          method: 'POST',
          body: { configTitle, configValue },
        };
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('Configuration API - Error saving configuration:', {
          response,
          meta,
          arg,
          status: response?.status,
          data: response?.data,
          message: response?.data?.message || response?.message || 'Unknown error'
        });
        return response;
      },
      invalidatesTags: ['Configuration'],
    }),

    // Delete a configuration
    deleteConfiguration: builder.mutation({
      query: ({ userId, configTitle }) => {
        console.log('Configuration API - Deleting configuration:', {
          userId,
          configTitle
        });
        return {
          url: `/${userId}/${configTitle}`,
          method: 'DELETE',
        };
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error('Configuration API - Error deleting configuration:', {
          response,
          meta,
          arg,
          status: response?.status,
          data: response?.data,
          message: response?.data?.message || response?.message || 'Unknown error'
        });
        return response;
      },
      invalidatesTags: ['Configuration'],
    }),
  }),
});

export const {
  useGetConfigurationsQuery,
  useAddOrUpdateConfigurationMutation,
  useDeleteConfigurationMutation,
} = configurationApiSlice;