import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: null, // Or set default structure like { username: "", email: "", isAuthenticatedToGithub: false }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
    },
  },
});

export const { setUserInfo, clearUserInfo } = authSlice.actions;

export default authSlice.reducer;
