// src/lib/services/portfolioAPI.ts
// Public Portfolio API - No authentication required

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type WorkType = "LOGO" | "WEBSITE" | "SOCIAL_MEDIA" | "REEL";
export type ClientType = "COMPANY" | "INDIVIDUAL";
export type WorkStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  slug: string;
  logoUrl?: string | null;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  description?: string | null;
}

export interface Media {
  id: string;
  fileType: "IMAGE" | "VIDEO";
  fileUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface WorkSection {
  id: string;
  sectionType: string;
  title: string;
  body: string;
  sortOrder: number;
  isHighlight: boolean;
  media?: Media[];
}

export interface Work {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  type: WorkType;
  status: WorkStatus;
  thumbnailUrl?: string | null;
  publishDate?: string | null;
  isFeatured: boolean;
  viewCount: number;
  sortOrder: number;
  client?: Client;
  media?: Media[];
  sections?: WorkSection[];
  tags?: { tag: Tag }[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
}

export interface PortfolioFilters {
  type?: WorkType;
  clientType?: ClientType;
  clientId?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "publishDate" | "createdAt" | "viewCount" | "sortOrder";
  order?: "asc" | "desc";
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PortfolioStats {
  totalWorks: number;
  totalClients: number;
  worksByType: { type: WorkType; _count: number }[];
  clientsByType: { type: ClientType; _count: number }[];
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchPublic(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || errorData.error || "Something went wrong"
    );
  }

  const data = await response.json();
  return data.data || data;
}

export const portfolioAPI = {
  // ✅ جلب جميع الأعمال مع فلاتر (Public)
  async getWorks(
    filters?: PortfolioFilters
  ): Promise<{ data: Work[]; pagination: PaginationInfo }> {
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.clientType) params.append("clientType", filters.clientType);
    if (filters?.clientId) params.append("clientId", filters.clientId);
    if (filters?.featured !== undefined)
      params.append("featured", String(filters.featured));
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.order) params.append("order", filters.order);

    const queryString = params.toString();
    const url = `${API_URL}/api/portfolio${queryString ? `?${queryString}` : ""}`;

    const response = await fetchPublic(url);
    return {
      data: response.data || response,
      pagination: response.pagination || {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false,
      },
    };
  },

  // ✅ جلب الأعمال المميزة (Public)
  async getFeaturedWorks(limit = 6): Promise<Work[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    return fetchPublic(`${API_URL}/api/portfolio/featured?${params}`);
  },

  // ✅ جلب عمل واحد بالتفصيل (Public)
  async getWorkBySlug(slug: string): Promise<Work> {
    return fetchPublic(`${API_URL}/api/portfolio/${slug}`);
  },

  // ✅ جلب جميع العملاء (Public)
  async getClients(type?: ClientType): Promise<Client[]> {
    const params = type ? new URLSearchParams({ type }) : "";
    return fetchPublic(
      `${API_URL}/api/portfolio/clients${params ? `?${params}` : ""}`
    );
  },

  // ✅ جلب عميل مع أعماله (Public)
  async getClientBySlug(slug: string, workType?: WorkType): Promise<Client> {
    const params = workType ? new URLSearchParams({ type: workType }) : "";
    return fetchPublic(
      `${API_URL}/api/portfolio/clients/${slug}${params ? `?${params}` : ""}`
    );
  },

  // ✅ جلب إحصائيات البورتفوليو (Public)
  async getStats(): Promise<PortfolioStats> {
    return fetchPublic(`${API_URL}/api/portfolio/stats`);
  },

  // ✅ إرسال نموذج التواصل (Public)
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<{ id: string; createdAt: string }> {
    const response = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || "فشل إرسال الرسالة"
      );
    }

    const result = await response.json();
    return result.data;
  },
};
