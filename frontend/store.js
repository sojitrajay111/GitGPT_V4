import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./features/authApiSlice";
import authReducer from "@/features/authSlice";
import { githubApiSlice } from "./features/githubApiSlice";
import { projectApiSlice } from "./features/projectApiSlice";
import { userStoryApiSlice } from "./features/userStoryApiSlice";
import { codeAnalysisApiSlice } from "./features/codeAnalysisApiSlice";
import { documentApi } from "./features/documentApiSlice";
import { developerApiSlice } from "./features/developerApiSlice";

import { gptApiSlice } from "./features/gptApiSlice";
import { configurationApiSlice } from "./features/configurationApiSlice";

import { jiraApi } from "./features/jiraSlice";
import { userManagementApi } from "./features/usermanagementSlice";
import { companyApi } from "./features/companyApi";
import serviceReducer from "./features/serviceSlice"; // ✅ Import serviceReducer
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { setupListeners } from '@reduxjs/toolkit/query';

// Configuration for persisting only the 'service' slice
const servicePersistConfig = {
  key: "service",
  storage,
  whitelist: ["service"], // Only persist the service slice
};

// Create persisted service reducer
const persistedServiceReducer = persistReducer(servicePersistConfig, serviceReducer);

export const store = configureStore({
  reducer: {
    [githubApiSlice.reducerPath]: githubApiSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [projectApiSlice.reducerPath]: projectApiSlice.reducer,
    [userStoryApiSlice.reducerPath]: userStoryApiSlice.reducer,
    [codeAnalysisApiSlice.reducerPath]: codeAnalysisApiSlice.reducer,

    [userManagementApi.reducerPath]: userManagementApi.reducer, 
    

    

    [documentApi.reducerPath]: documentApi.reducer,
    [developerApiSlice.reducerPath]: developerApiSlice.reducer,
    [gptApiSlice.reducerPath]: gptApiSlice.reducer,
    [jiraApi.reducerPath]: jiraApi.reducer,
        [configurationApiSlice.reducerPath]: configurationApiSlice.reducer,
    [companyApi.reducerPath]: companyApi.reducer,
    service: persistedServiceReducer,

    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      githubApiSlice.middleware,
      authApiSlice.middleware,
      projectApiSlice.middleware,
      userStoryApiSlice.middleware,
      codeAnalysisApiSlice.middleware,

      userManagementApi.middleware,


      documentApi.middleware,
      developerApiSlice.middleware,
      gptApiSlice.middleware,
      jiraApi.middleware,
   configurationApiSlice.middleware,

      companyApi.middleware
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
