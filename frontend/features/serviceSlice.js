import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedService: null,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setService: (state, action) => {
      state.selectedService = action.payload;
      console.log("Redux Updated:", state.selectedService); // Debugging
    },

    clearService: (state) => {
      state.selectedService = null;
      console.log("Redux Updated(service cleared):", state.selectedService); // Debugging
    },
  },
});
// const serviceSlice = createSlice({
//   name: "service",
//   initialState,
//   reducers: {
//     setService: (state, action) => {
//       state.selectedService = action.payload;
//     },
//     clearService: (state) => {
//       state.selectedService = null;
//     },
//   },
// });

export const { setService, clearService } = serviceSlice.actions;
export default serviceSlice.reducer;
