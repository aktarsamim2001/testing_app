

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/auth";
import clientsReducer from "./slices/clients";
import partnersReducer from "./slices/partners";
import authorsReducer from "./slices/authors";
import categoriesReducer from "./slices/categorySlice";
import blogCategoriesReducer from "./slices/blog-categories";
import blogsReducer from "./slices/blogs";
import campaignsReducer from "./slices/campaigns";
import campaignAssignablePartnersReducer from "./slices/campaignAssignablePartners";
import campaignPartnersReducer from "./slices/campaignPartners";
import pagesReducer from "./slices/pages";
import servicesReducer from "./slices/services";
import subscriptionsReducer from "./slices/subscriptions";
import settingsReducer from "./slices/settings";
import adminDashboardReducer from "./slices/adminDashboard";
import menusReducer from "./slices/menus";
import menuItemsReducer from "./slices/menuItems";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    partners: partnersReducer,
    categories: categoriesReducer,
    blogCategories: blogCategoriesReducer,
    authors: authorsReducer,
    blogs: blogsReducer,
    campaigns: campaignsReducer,
    campaignPartners: campaignPartnersReducer,
    campaignAssignablePartners: campaignAssignablePartnersReducer,
    pages: pagesReducer,
    services: servicesReducer,
    subscriptions: subscriptionsReducer,
    settings: settingsReducer,
    adminDashboard: adminDashboardReducer,
    menus: menusReducer,
    menuItems: menuItemsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
