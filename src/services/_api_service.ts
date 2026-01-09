// Delete a page
export async function deletePage(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/page/delete", { id }, { headers: headers as Record<string, string> });
}

import type { PageUpdatePayload } from '@/store/slices/pages';

// Update a page
export async function updatePage(payload: PageUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/page/update", payload, { headers: headers as Record<string, string> });
}
// Fetch admin page list
export async function getAdminPagesList(page = 1, limit = 10, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.get(rootUrl + "api/web/admin/page/list", {
    params: { page, limit },
    headers: headers as Record<string, string>,
  });
}
// ==================== PAGE APIs ====================


export interface PageCreatePayload {
  template: string;
  title: string;
  slug: string;
  meta_title: string;
  meta_author: string;
  meta_keywords: string;
  meta_description: string;
  meta_feature_image?: string;
  data: any[];
  status: string | number;
}

// Create a new page
export async function createPage(payload: PageCreatePayload, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  return axios.post(rootUrl + "api/web/admin/page/create", payload, { headers });
}
// Fetch available partners for campaign assignment
export async function fetchCampaignPartnerListAPI(page = 1, limit = 100): Promise<any> {
  const headers = await authHeader();
  return axios.get(rootUrl + "api/web/admin/campaign/partner-list", {
    params: { page, limit },
    headers: headers as Record<string, string>,
  });
}
// Fetch assigned partners for a campaign
export async function fetchCampaignPartnersAPI(campaignId: string): Promise<any> {
  const headers = await authHeader();
  return axios.post(rootUrl + "api/web/admin/campaign/assign-partner-list", { campaign_id: campaignId }, { headers: headers as Record<string, string> });
}

// Fetch admin dashboard stats
export async function fetchAdminDashboard(token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.get(rootUrl + "api/web/admin/dashboard", { headers: headers as Record<string, string> });
}

// Fetch menu list
export async function fetchMenuList(page = 1, limit = 100, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.get(rootUrl + "api/web/admin/menu/list", {
    params: { page, limit },
    headers: headers as Record<string, string>,
  });
}

// Update a menu
export async function updateMenu(payload: { id: string | number; menu_name?: string; status?: string | number }, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/menu/update", payload, { headers: headers as Record<string, string> });
}

// ==================== MENU ITEM APIs ====================

// Fetch menu items by menu_id
export async function fetchMenuItems(menuId: string | number, page = 1, limit = 10, token?: string | null, search?: string): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  const params: any = { menu_id: menuId, page, limit };
  if (typeof search === 'string' && search.trim() !== '') params.search = search.trim();
  return axios.get(rootUrl + `api/web/admin/menu/item/list`, {
    params,
    headers: headers as Record<string, string>,
  });
}

// Create a menu item
export async function createMenuItem(payload: { menu_id: string | number; type: string; title: string; slug?: string; target_set?: string; status: string | number }, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/menu/item/create", payload, { headers: headers as Record<string, string> });
}

// Update a menu item
export async function updateMenuItem(payload: { id: string | number; type?: string; title?: string; slug?: string; target_set?: string; status?: string | number }, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/menu/item/update", payload, { headers: headers as Record<string, string> });
}

// Delete a menu item
export async function deleteMenuItem(id: string | number, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/menu/item/delete", { id }, { headers: headers as Record<string, string> });
}

// Reorder menu items
export async function reorderMenuItems(payload: { item_id: Array<string | number> }, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/menu/item/reorder", payload, { headers: headers as Record<string, string> });
}

import axios from "axios";
import { authHeader } from "@/helpers/auth-header";

const rootUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://influencer-marketing-api.notebrains.com/";

// Setup axios interceptor for handling 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("profileData");
        window.location.href = "/admin/login"; // Redirect to admin login
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================

interface RegisterPayload {
  user_type: "brand" | "creator";
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  password: string;
  channel_type?: string;
  platform_handle?: string;
}

interface RegisterResponse {
  status: number;
  message: string;
}

interface LoginPayload {
  user_type: "admin" | "brand" | "creator";
  email: string;
  password: string;
}

interface LoginResponse {
  status: number;
  message: string;
}

// ==================== CLIENT APIs ====================

export interface ClientListResponse {
  status: number;
  message: string;
  data: Client[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  website: string | null;
  notes: string | null;
  status: number;
}

interface ClientCreatePayload {
  company_name: string;
  name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  notes?: string | null;
  status?: number | string;
}

interface ClientUpdatePayload extends ClientCreatePayload {
  id: string;
}

async function register(payload: RegisterPayload): Promise<any> {
  return axios.post<RegisterResponse>(rootUrl + "api/auth/register", payload);
}

async function login(payload: LoginPayload): Promise<any> {
  return axios.post<LoginResponse>(rootUrl + "api/auth/login", payload);
}

async function fetchClients(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<ClientListResponse>(rootUrl + "api/web/admin/client/list", {
    params: { page, limit, search },
    headers: headers as Record<string, string>,
  });
}

async function createClient(payload: ClientCreatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/client/create", payload, { headers: headers as Record<string, string> });
}

async function updateClient(payload: ClientUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/client/update", payload, { headers: headers as Record<string, string> });
}

async function deleteClient(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/client/delete", { id }, { headers: headers as Record<string, string> });
}

// ==================== PARTNER APIs ====================

export interface PartnerListResponse {
  status: number;
  message: string;
  data: Partner[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  channel_type: string;
  platform_handle: string | null;
  follower_count: number | null;
  engagement_rate: number | null;
  categories: string | null;
  notes: string | null;
  status: number;
}

interface PartnerCreatePayload {
  name: string;
  email: string;
  channel_type: string;
  platform_handle?: string | null;
  follower_count?: number | null;
  engagement_rate?: number | null;
  categories?: string | null; // API expects comma-separated string
  notes?: string | null;
  status?: number;
}

interface PartnerUpdatePayload extends PartnerCreatePayload {
  id: string;
}

async function fetchPartners(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<PartnerListResponse>(rootUrl + "api/web/admin/partner/list", {
    params: { page, limit, search },
    headers: headers as Record<string, string>,
  });
}

async function createPartner(payload: PartnerCreatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/partner/create", payload, { headers: headers as Record<string, string> });
}

async function updatePartner(payload: PartnerUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/partner/update", payload, { headers: headers as Record<string, string> });
}

async function deletePartner(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/partner/delete", { id }, { headers: headers as Record<string, string> });
}

// ==================== AUTHOR APIs ====================
// ==================== CATEGORY APIs ====================

export interface Category {
  id: string;
  name: string;
  status: number;
}

export interface CategoryCreatePayload {
  name: string;
  status: string | number;
}

export interface CategoryUpdatePayload extends CategoryCreatePayload {
  id: string;
}

async function fetchCategories(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get(rootUrl + "api/web/admin/category/list", {
    params: { page, limit, search },
    headers: headers as Record<string, string>,
  });
}

async function createCategory(payload: CategoryCreatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/category/create", payload, { headers: headers as Record<string, string> });
}

async function updateCategory(payload: CategoryUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/category/update", payload, { headers: headers as Record<string, string> });
}

async function deleteCategory(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/category/delete", { id }, { headers: headers as Record<string, string> });
}

// ==================== BLOG CATEGORY APIs ====================

export interface BlogCategory {
  id: string;
  name: string;
  status: number;
}

export interface BlogCategoryCreatePayload {
  name: string;
  status: string | number;
}

export interface BlogCategoryUpdatePayload extends BlogCategoryCreatePayload {
  id: string;
}

export interface BlogCategoryListResponse {
  status: number;
  message: string;
  data: BlogCategory[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

async function fetchBlogCategories(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<BlogCategoryListResponse>(rootUrl + "api/web/admin/blog-category/list", {
    params: { page, limit, search },
    headers: headers as Record<string, string>,
  });
}

async function createBlogCategory(payload: BlogCategoryCreatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/blog-category/create", payload, { headers: headers as Record<string, string> });
}

async function updateBlogCategory(payload: BlogCategoryUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/blog-category/update", payload, { headers: headers as Record<string, string> });
}

async function deleteBlogCategory(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/blog-category/delete", { id }, { headers: headers as Record<string, string> });
}

export interface AuthorListResponse {
  status: number;
  message: string;
  data: Author[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

export interface Author {
  id: string;
  name: string;
  image: string;
  about: string | null;
}

async function fetchAuthors(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<AuthorListResponse>(rootUrl + "api/web/admin/blog-author/list", {
    params: { page, limit, search },
    headers: headers as Record<string, string>,
  });
}

async function createAuthor(payload: any, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  return axios.post(rootUrl + "api/web/admin/blog-author/create", payload, { 
    headers
  });
}

async function updateAuthor(payload: any, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  return axios.post(rootUrl + "api/web/admin/blog-author/update", payload, { 
    headers
  });
}

async function deleteAuthor(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/blog-author/delete", { id }, { headers: headers as Record<string, string> });
}

// ==================== BLOG APIs ====================

export interface BlogListResponse {
  status: number;
  message: string;
  data: Blog[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_id: string;
  category_id?: string;
  image: string;
  description: string;
  estimated_reading_time: string;
  tags: string;
  faq: BlogFaq[];
  meta_author: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  status: "Draft" | "Published";
  published_at: string;
  created_at?: string;
  updated_at?: string;
}

interface BlogCreatePayload {
  title: string;
  slug: string;
  excerpt: string;
  author_id: string;
  category_id: string;
  image: string;
  description: string;
  estimated_reading_time: string;
  tags: string;
  faq: BlogFaq[];
  meta_author: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  status: "Draft" | "Published";
  published_at: string;
}

interface BlogUpdatePayload extends BlogCreatePayload {
  id: string;
}

async function fetchBlogs(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  const params: any = { page, limit };
  if (search) params.search = search;

  return axios.get<BlogListResponse>(rootUrl + "api/web/admin/blog/list", {
    params,
    headers: headers as Record<string, string>,
  });
}

async function createBlog(payload: BlogCreatePayload, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  return axios.post(rootUrl + "api/web/admin/blog/create", payload, { headers: headers as Record<string, string> });
}

async function updateBlog(payload: BlogUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  // Sanitize estimated_reading_time if present
  let sanitizedPayload = { ...payload };
  if (sanitizedPayload.estimated_reading_time && typeof sanitizedPayload.estimated_reading_time === "string") {
    sanitizedPayload.estimated_reading_time = sanitizedPayload.estimated_reading_time.replace(/[^\d.]/g, "");
  }
  try {
    console.log("updateBlog payload:", sanitizedPayload);
    return await axios.post(rootUrl + "api/web/admin/blog/update", sanitizedPayload, { headers: headers as Record<string, string> });
  } catch (error: any) {
    console.log("updateBlog error status:", error.response?.status);
    console.log("updateBlog error data:", error.response?.data);
    console.log("updateBlog error message:", error.message);
    throw error;
  }
}

async function deleteBlog(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/blog/delete", { id }, { headers: headers as Record<string, string> });
}

// ==================== CAMPAIGN APIs ====================

export interface CampaignListResponse {
  status: number;
  message: string;
  data: Campaign[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  client_id: string;
  budget: number | string;
  campaign_type: "blogger_outreach" | "linkedin_influencer" | "youtube_campaign" | string;
  status: "Planning" | "Active" | "Paused" | "Completed" | "Cancelled" | string;
  start_date: string;
  end_date: string;
  description: string;
  campaign_goals: string;
  target_audience: string;
  created_at?: string;
  updated_at?: string;
}

interface CampaignCreatePayload {
  name: string;
  client_id: string;
  budget: number | string;
  campaign_type: string;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
  campaign_goals: string;
  target_audience: string;
}

interface CampaignUpdatePayload extends CampaignCreatePayload {
  id: string;
}

async function fetchCampaigns(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  const params: any = { page, limit };
  if (search) params.search = search;

  return axios.get<CampaignListResponse>(rootUrl + "api/web/admin/campaign/list", {
    params,
    headers: headers as Record<string, string>,
  });
}

async function createCampaign(payload: CampaignCreatePayload, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  return axios.post(rootUrl + "api/web/admin/campaign/create", payload, { headers });
}

async function updateCampaign(payload: CampaignUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/campaign/update", payload, { headers: headers as Record<string, string> });
}

async function deleteCampaign(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/campaign/delete", { id }, { headers: headers as Record<string, string> });
}

// Fetch single campaign by id
async function campaignView(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/campaign/view", { id }, { headers: headers as Record<string, string> });
}

// ==================== CAMPAIGN PARTNER APIs ====================

// Assign a partner to a campaign
export async function assignPartnerToCampaignAPI(payload: {
  campaign_id: string;
  partner_id: string;
  compensation?: string | number;
  notes?: string;
  status?: string;
}): Promise<any> {
  const headers = await authHeader();
  return axios.post(rootUrl + "api/web/admin/campaign/assign-partner", payload, { headers: headers as Record<string, string> });
}

// Remove a partner from a campaign
export async function removePartnerFromCampaignAPI(id: string): Promise<any> {
  const headers = await authHeader();
  return axios.post(rootUrl + "api/web/admin/campaign/remove-partner", { id }, { headers: headers as Record<string, string> });
}

// Fetch platform settings
export async function fetchSettings() {
  const headers = await authHeader();
  return axios.get(rootUrl + 'api/web/admin/setting/details', { headers: headers as Record<string, string> }).then(res => res.data);
}

// Update platform settings
export async function updateSettings(payload: any) {
  const headers = await authHeader();
  return axios.post(rootUrl + 'api/web/admin/setting/update', payload, { headers: headers as Record<string, string> }).then(res => res.data);
}

// ==================== SERVICE APIs ====================

export interface ServiceListItem {
  id: string;
  name: string;
  flag: "Service" | "Full_Service";
  image?: string;
  price: number | string;
  discount_price?: string;
  status: number;
  short_description?: string;
  description?: string;
  service_ids?: string;
  what_included?: Array<{ title: string }>;
  key_benefits?: Array<{ title: string }>;
  additional_benefits?: Array<{ title: string }>;
}

export interface ServiceListResponse {
  status: number;
  message: string;
  data: ServiceListItem[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

export interface ServiceCreatePayload {
  flag: "Service" | "Full_Service";
  name: string;
  image?: string;
  short_description: string;
  description?: string;
  price: string | number;
  discount_price?: string;
  what_included?: Array<{ title: string }>;
  key_benefits?: Array<{ title: string }>;
  service_ids?: string;
  additional_benefits?: Array<{ title: string }>;
  status: number | string;
}

export interface ServiceUpdatePayload extends ServiceCreatePayload {
  id: string;
}

async function fetchServices(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  const params: any = { page, limit };
  if (search) params.search = search;

  return axios.get<ServiceListResponse>(rootUrl + "api/web/admin/service/list", {
    params,
    headers: headers as Record<string, string>,
  });
}

async function createService(payload: ServiceCreatePayload, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  console.log('API createService - sending payload:', payload);
  try {
    const response = await axios.post(rootUrl + "api/web/admin/service/create", payload, { headers });
    console.log('API createService - response:', response);
    return response;
  } catch (error: any) {
    console.error('API createService - error:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    throw error;
  }
}

async function updateService(payload: ServiceUpdatePayload, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  return axios.post(rootUrl + "api/web/admin/service/update", payload, { headers });
}

async function deleteService(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/service/delete", { id }, { headers: headers as Record<string, string> });
}

// ==================== SUBSCRIPTION APIs ====================

export interface SubscriptionListItem {
  id: string;
  name: string;
  flag: "Normal" | "AddOn";
  price: number | string;
  status: number;
  description?: string;
}

export interface SubscriptionListResponse {
  status: number;
  message: string;
  data: SubscriptionListItem[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

export interface SubscriptionCreatePayload {
  flag: "Normal" | "AddOn";
  name: string;
  partnerships?: string;
  price: string | number;
  description: string;
  features?: Array<{ title: string }>;
  popular?: number | string;
  status: number | string;
}

export interface SubscriptionUpdatePayload extends SubscriptionCreatePayload {
  id: string;
}

async function fetchSubscriptions(
  page = 1,
  limit = 10,
  token?: string | null,
  search?: string
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  const params: any = { page, limit };
  if (search) params.search = search;

  return axios.get<SubscriptionListResponse>(rootUrl + "api/web/admin/subscription/list", {
    params,
    headers: headers as Record<string, string>,
  });
}

async function createSubscription(payload: SubscriptionCreatePayload, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  return axios.post(rootUrl + "api/web/admin/subscription/create", payload, { headers });
}

async function updateSubscription(payload: SubscriptionUpdatePayload, token?: string | null): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }
  
  return axios.post(rootUrl + "api/web/admin/subscription/update", payload, { headers });
}

async function deleteSubscription(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/subscription/delete", { id }, { headers: headers as Record<string, string> });
}


export const service = {
  deletePage,
  updatePage,
  getAdminPagesList,
  register,
  login,
  fetchClients,
  createClient,
  fetchAdminDashboard,
  fetchMenuList,
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  fetchCampaignPartnerListAPI,
  updateClient,
  deleteClient,
  fetchPartners,
  createPartner,
  updatePartner,
  deletePartner,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchBlogCategories,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory,
  fetchAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  campaignView,
  assignPartnerToCampaignAPI,
  removePartnerFromCampaignAPI,
  createPage,
  fetchSettings,
  updateSettings,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  updateMenu,
};
