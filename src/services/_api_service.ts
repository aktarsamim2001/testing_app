// Delete a page
export async function deletePage(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/page/delete", { id }, { headers });
}
export interface PageUpdatePayload {
  id: string;
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

// Update a page
export async function updatePage(payload: PageUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/page/update", payload, { headers });
}
// Fetch admin page list
export async function getAdminPagesList(page = 1, limit = 10, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.get(rootUrl + "api/web/admin/page/list", {
    params: { page, limit },
    headers,
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
    headers,
  });
}
// Fetch assigned partners for a campaign
export async function fetchCampaignPartnersAPI(campaignId: string): Promise<any> {
  const headers = await authHeader();
  return axios.post(rootUrl + "api/web/admin/campaign/assign-partner-list", { campaign_id: campaignId }, { headers });
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
        window.location.href = "/auth";
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
  token?: string | null
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<ClientListResponse>(rootUrl + "api/web/admin/client/list", {
    params: { page, limit },
    headers,
  });
}

async function createClient(payload: ClientCreatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/client/create", payload, { headers });
}

async function updateClient(payload: ClientUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/client/update", payload, { headers });
}

async function deleteClient(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/client/delete", { id }, { headers });
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
  token?: string | null
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<PartnerListResponse>(rootUrl + "api/web/admin/partner/list", {
    params: { page, limit },
    headers,
  });
}

async function createPartner(payload: PartnerCreatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/partner/create", payload, { headers });
}

async function updatePartner(payload: PartnerUpdatePayload, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/partner/update", payload, { headers });
}

async function deletePartner(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/partner/delete", { id }, { headers });
}

// ==================== AUTHOR APIs ====================

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
  token?: string | null
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<AuthorListResponse>(rootUrl + "api/web/admin/blog-author/list", {
    params: { page, limit },
    headers,
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
  return axios.post(rootUrl + "api/web/admin/blog-author/delete", { id }, { headers });
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
  token?: string | null
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<BlogListResponse>(rootUrl + "api/web/admin/blog/list", {
    params: { page, limit },
    headers,
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
  
  return axios.post(rootUrl + "api/web/admin/blog/create", payload, { headers });
}

async function updateBlog(payload: BlogUpdatePayload, token?: string | null): Promise<any> {
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
  
  return axios.post(rootUrl + "api/web/admin/blog/update", payload, { headers });
}

async function deleteBlog(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/blog/delete", { id }, { headers });
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
  token?: string | null
): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return axios.get<CampaignListResponse>(rootUrl + "api/web/admin/campaign/list", {
    params: { page, limit },
    headers,
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
  
  return axios.post(rootUrl + "api/web/admin/campaign/update", payload, { headers });
}

async function deleteCampaign(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/campaign/delete", { id }, { headers });
}

// Fetch single campaign by id
async function campaignView(id: string, token?: string | null): Promise<any> {
  const baseHeaders = await authHeader();
  const headers = token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
  return axios.post(rootUrl + "api/web/admin/campaign/view", { id }, { headers });
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
  return axios.post(rootUrl + "api/web/admin/campaign/assign-partner", payload, { headers });
}

// Remove a partner from a campaign
export async function removePartnerFromCampaignAPI(id: string): Promise<any> {
  const headers = await authHeader();
  return axios.post(rootUrl + "api/web/admin/campaign/remove-partner", { id }, { headers });
}

export const service = {
  deletePage,
  updatePage,
  getAdminPagesList,
  register,
  login,
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  fetchPartners,
  createPartner,
  updatePartner,
  deletePartner,
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
  fetchCampaignPartnersAPI,
  assignPartnerToCampaignAPI,
  removePartnerFromCampaignAPI,
  createPage,
};
