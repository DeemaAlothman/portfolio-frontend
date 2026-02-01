// src/lib/services/portfolioAPI.ts
// Public Portfolio API - No authentication required
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
  works?: Work[]; // أعمال العميل
  _count?: {
    works: number;
  };
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
  status?: WorkStatus;
  thumbnailUrl?: string | null;
  mediaUrl?: string | null; // كل سجل عنده URL واحد (كل ملف = سجل منفصل)
  mediaType?: "IMAGE" | "VIDEO";
  publishDate?: string | null;
  isFeatured?: boolean;
  viewCount?: number;
  sortOrder?: number;
  client?: Client;
  company?: Client; // Backend uses this for corporate works
  media?: Media[];
  sections?: WorkSection[];
  tags?: { tag: Tag }[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  websiteUrl?: string | null;
  category?: "INDIVIDUAL" | "CORPORATE";
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
    // Backend uses 'category' instead of 'clientType'
    if (filters?.clientType) {
      params.append("category", filters.clientType === "COMPANY" ? "CORPORATE" : "INDIVIDUAL");
    }
    if (filters?.clientId) params.append("companyId", filters.clientId);
    if (filters?.featured !== undefined)
      params.append("featured", String(filters.featured));
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.order) params.append("order", filters.order);

    const queryString = params.toString();
    const url = `${API_URL}/api/portfolio${queryString ? `?${queryString}` : ""}`;

    const response = await fetchPublic(url);

    // Backend يرجع { portfolioItems: [...], count: N }
    let items = response.portfolioItems || response.data || response;
    const count = response.count || 0;

    // Transform items to match our interface
    items = Array.isArray(items) ? items.map((item: any) => {
      // استخراج mediaUrl من عدة مصادر محتملة
      const resolvedMediaUrl = item.mediaUrl
        || (item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls[0] : null)
        || (item.media && item.media.length > 0 ? item.media[0].fileUrl : null);

      return {
        ...item,
        mediaUrl: resolvedMediaUrl,
        thumbnailUrl: item.thumbnailUrl || resolvedMediaUrl || null,
        // Add client from company for compatibility
        client: item.company || item.client,
        // Normalize viewCount
        viewCount: item.viewCount || 0,
      };
    }) : [];

    return {
      data: items,
      pagination: {
        total: count,
        limit: filters?.limit || 50,
        offset: filters?.offset || 0,
        hasMore: count > (filters?.offset || 0) + (filters?.limit || 50),
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

  // ✅ جلب جميع الشركات/العملاء (Public)
  async getClients(type?: ClientType): Promise<Client[]> {
    const params = type ? new URLSearchParams({ type }) : "";
    const response = await fetchPublic(
      `${API_URL}/api/companies${params ? `?${params}` : ""}`
    );

    // Backend يرجع { companies: [...] }
    let companies = response && response.companies ? response.companies :
                    Array.isArray(response) ? response : [];

    // تحويل logo إلى logoUrl لأن Backend يستخدم logo
    companies = companies.map((company: any) => ({
      ...company,
      logoUrl: company.logo || company.logoUrl,
      // إذا في type parameter، نستخدمه، إلا نحط COMPANY بشكل افتراضي
      type: company.type || type || "COMPANY",
      _count: {
        works: company._count?.portfolioItems || company._count?.works || 0
      }
    }));

    return companies;
  },

  // ✅ جلب شركة/عميل محدد مع أعماله (Public)
  async getClientBySlug(slug: string, workType?: WorkType): Promise<Client> {
    // Since Backend doesn't support fetching by slug, we'll:
    // 1. Fetch all companies
    // 2. Find the one matching the slug
    // 3. Fetch its works separately

    const allClients = await this.getClients();
    const client = allClients.find(c => c.slug === slug);

    if (!client) {
      throw new ApiError(404, "العميل غير موجود");
    }

    // Fetch works for this client
    const worksResponse = await this.getWorks({
      clientId: client.id,
      type: workType,
      limit: 100 // Get all works for this client
    });

    // Ensure works is always an array
    const works = Array.isArray(worksResponse.data) ? worksResponse.data : [];

    // Return client with works
    return {
      ...client,
      works: works
    };
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
