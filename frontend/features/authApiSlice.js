import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({

    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,

    credentials: "include",
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (userData) => ({
        url: "auth/signup",
        method: "POST",
        body: userData, // userData will now include username, email, password, role
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials, // credentials will now include identifier (username/email) and password
      }),
    }),
    // logout: builder.mutation({
    //   query: () => ({
    //     url: "auth/logout",
    //     method: "POST",
    //   }),
    // }),
  }),
});

export const { useSignupMutation, useLoginMutation, useLogoutMutation } =
  authApiSlice;
