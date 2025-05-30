import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./features/authApiSlice";
import authReducer from "@/features/authSlice";
import { githubApiSlice } from "./features/githubApiSlice";
import { projectApiSlice } from "./features/projectApiSlice";
import { userStoryApiSlice } from "./features/userStoryApiSlice";
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
    [githubApiSlice.reducerPath]: githubApiSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [projectApiSlice.reducerPath]: projectApiSlice.reducer,
    [userStoryApiSlice.reducerPath]: userStoryApiSlice.reducer,
    service: persistedServiceReducer, // ✅ Add persisted service reducer
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApiSlice.middleware,
      githubApiSlice.middleware,
      projectApiSlice.middleware,
      userStoryApiSlice.middleware
    ),
});

export const persistor = persistStore(store);
