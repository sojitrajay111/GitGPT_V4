import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./features/authApiSlice";
import authReducer from "@/features/authSlice";
import { githubApiSlice } from "./features/githubApiSlice";
import { projectApiSlice } from "./features/projectApiSlice";
import { userStoryApiSlice } from "./features/userStoryApiSlice";
import { codeAnalysisApiSlice } from "./features/codeAnalysisApiSlice";
import { documentApi } from "./features/documentApiSlice";
import { developerApiSlice } from "./features/developerApiSlice";
import { themeApi } from "./features/themeApiSlice";
import { apiSlice } from "./features/apiSlice";
import { configurationApiSlice } from "./features/configurationApiSlice";
import { notificationApi } from "./features/notificationApiSlice";
import { userManagementApi } from "./features/usermanagementSlice";
import { companyApi } from "./features/companyApi";
import serviceReducer from "./features/serviceSlice"; // ✅ Import serviceReducer
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query";
import { userProfileApiSlice } from "./features/userProfileApiSlice";
import { projectMetricsApiSlice } from "./features/projectMetricsApiSlice";
import { collaboratorApi } from "./features/collaboratorApiSlice";

// Configuration for persisting only the 'service' slice
const servicePersistConfig = {
  key: "service",
  storage,
  whitelist: ["service"], // Only persist the service slice
};

// Create persisted service reducer
const persistedServiceReducer = persistReducer(
  servicePersistConfig,
  serviceReducer
);

export const store = configureStore({
  reducer: {
    [githubApiSlice.reducerPath]: githubApiSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [projectApiSlice.reducerPath]: projectApiSlice.reducer,
    [userStoryApiSlice.reducerPath]: userStoryApiSlice.reducer,
    [codeAnalysisApiSlice.reducerPath]: codeAnalysisApiSlice.reducer,
    [userManagementApi.reducerPath]: userManagementApi.reducer,
    [themeApi.reducerPath]: themeApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [developerApiSlice.reducerPath]: developerApiSlice.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [configurationApiSlice.reducerPath]: configurationApiSlice.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    [projectMetricsApiSlice.reducerPath]: projectMetricsApiSlice.reducer,
    [collaboratorApi.reducerPath]: collaboratorApi.reducer,
    service: persistedServiceReducer,

    auth: authReducer,
    [userProfileApiSlice.reducerPath]: userProfileApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      githubApiSlice.middleware,
      authApiSlice.middleware,
      projectApiSlice.middleware,
      userStoryApiSlice.middleware,
      codeAnalysisApiSlice.middleware,
      themeApi.middleware,
      userManagementApi.middleware,
      documentApi.middleware,
      developerApiSlice.middleware,
      notificationApi.middleware,
      apiSlice.middleware,
      configurationApiSlice.middleware,
      companyApi.middleware,
      userProfileApiSlice.middleware,
      projectMetricsApiSlice.middleware,
      collaboratorApi.middleware
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
