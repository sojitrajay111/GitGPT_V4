import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./features/authApiSlice";
import authReducer from "@/features/authSlice";
import { githubApiSlice } from "./features/githubApiSlice";
import { projectApiSlice } from "./features/projectApiSlice";
import { userStoryApiSlice } from "./features/userStoryApiSlice";
import { codeAnalysisApiSlice } from "./features/codeAnalysisApiSlice";
import { documentApi } from "./features/documentApiSlice";
import { developerApiSlice } from "./features/developerApiSlice";
import { userApi } from './features/userApiSlice'; 
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
    [userApi.reducerPath]: userApi.reducer,
    [projectApiSlice.reducerPath]: projectApiSlice.reducer,
    [userStoryApiSlice.reducerPath]: userStoryApiSlice.reducer,
    [codeAnalysisApiSlice.reducerPath]: codeAnalysisApiSlice.reducer,
    [documentApi.reducerPath]: documentApi.reducer, // Add documentApi
    [developerApiSlice.reducerPath]: developerApiSlice.reducer, // Add developerApi
    service: persistedServiceReducer, // ✅ Add persisted service reducer
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      authApiSlice.middleware,
      githubApiSlice.middleware,
      userApi.middleware ,
      projectApiSlice.middleware,
      userStoryApiSlice.middleware,
      codeAnalysisApiSlice.middleware,
      documentApi.middleware, // Add documentApi middleware
      developerApiSlice.middleware // Add developerApi middleware
    ),
});

export const persistor = persistStore(store);
