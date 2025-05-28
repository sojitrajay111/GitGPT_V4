import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./features/authApiSlice";
import serviceReducer from "./features/serviceSlice"; // ✅ Import serviceReducer

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

// Configuration for persisting only the 'service' slice
const persistConfig = {
  key: "service",
  storage,
  whitelist: ["service"],
};

// Wrap serviceReducer with persistence
const persistedServiceReducer = persistReducer(persistConfig, serviceReducer);

export const store = configureStore({
  reducer: {
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    service: persistedServiceReducer, // ✅ Add persisted service reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApiSlice.middleware
    ),
});

export const persistor = persistStore(store);
