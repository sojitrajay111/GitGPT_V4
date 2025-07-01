import { createSlice } from "@reduxjs/toolkit";

const getInitialUserInfo = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
  }
  return null;
};

const initialState = {
  userInfo: getInitialUserInfo(),
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
