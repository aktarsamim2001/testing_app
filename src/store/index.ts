

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/auth";
import clientsReducer from "./slices/clients";
import partnersReducer from "./slices/partners";
import authorsReducer from "./slices/authors";
import blogsReducer from "./slices/blogs";
import campaignsReducer from "./slices/campaigns";
import campaignAssignablePartnersReducer from "./slices/campaignAssignablePartners";
import campaignPartnersReducer from "./slices/campaignPartners";
import pagesReducer from "./slices/pages";
import settingsReducer from "./slices/settings";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    partners: partnersReducer,
    authors: authorsReducer,
    blogs: blogsReducer,
    campaigns: campaignsReducer,
    campaignPartners: campaignPartnersReducer,
    campaignAssignablePartners: campaignAssignablePartnersReducer,
    pages: pagesReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
