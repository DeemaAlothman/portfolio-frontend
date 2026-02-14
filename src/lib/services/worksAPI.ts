const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type WorkType = "LOGO" | "WEBSITE" | "SOCIAL_MEDIA" | "REEL";
export type WorkStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type CategoryType = "INDIVIDUAL" | "CORPORATE";

export interface Work {
  id: string;
  title: string;
  description?: string;
  type: WorkType;
  category: CategoryType;
  clientName?: string; // للأفراد
  companyId?: string; // للشركات
  websiteUrl?: string; // للمواقع الإلكترونية
  tag?: string | null; // Custom tag text (e.g., "موشن جرافيك")
  slug: string;
  createdAt: string;
  updatedAt: string;
  // الباك إند الآن يرجع URL واحد لكل سجل (كل ملف = سجل منفصل)
  mediaUrl?: string;
  mediaType?: string; // IMAGE أو VIDEO
  company?: {
    id: string;
    name: string;
    logo?: string; // URL كامل للوغو الشركة
  };
  // القديم - للتوافق مع الكود القديم
  media?: Media[];
}

export interface Media {
  id: string;
  workId: string;
  fileType: string;
  fileUrl: string;
  altText?: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface WorksFilters {
  type?: WorkType;
  category?: CategoryType;
  companyId?: string;
}

export interface CreateWorkData {
  title: string;
  description?: string;
  type: WorkType;
  category: CategoryType;
  clientName?: string; // مطلوب للأفراد
  companyId?: string; // مطلوب للشركات
  websiteUrl?: string; // مطلوب للمواقع الإلكترونية
  file?: File; // ملف واحد (للموقع فقط)
  files?: File[]; // ملفات متعددة (للشعار، الريلز، السوشال ميديا)
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "حدث خطأ ما");
  }

  return data;
}

export const worksAPI = {
  async getAll(filters?: WorksFilters): Promise<Work[]> {
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.companyId) params.append("companyId", filters.companyId);

    const queryString = params.toString();
    const endpoint = queryString ? `/api/portfolio?${queryString}` : "/api/portfolio";

    const response = await fetchAPI(endpoint);

    // إذا الباك راجع object فيه portfolioItems
    let items = response?.portfolioItems || (Array.isArray(response) ? response : []);

    // التأكد من وجود mediaUrl لكل سجل (fallback من مصادر مختلفة)
    return items.map((item: any) => ({
      ...item,
      mediaUrl: item.mediaUrl
        || (item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls[0] : undefined)
        || (item.media && item.media.length > 0 ? item.media[0].fileUrl : undefined),
    }));
  },

  async getBySlug(slug: string): Promise<Work> {
    return fetchAPI(`/api/portfolio/${slug}`);
  },

  async getById(id: string): Promise<Work> {
    const response = await fetchAPI(`/api/portfolio/${id}`);

    // إذا الباك راجع object فيه portfolioItem
    const item = response?.portfolioItem || response;

    // التأكد من وجود mediaUrl (fallback من مصادر مختلفة)
    return {
      ...item,
      mediaUrl: item.mediaUrl
        || (item.mediaUrls && item.mediaUrls.length > 0 ? item.mediaUrls[0] : undefined)
        || (item.media && item.media.length > 0 ? item.media[0].fileUrl : undefined),
    };
  },

  async getByType(type: WorkType): Promise<Work[]> {
    return fetchAPI(`/api/portfolio/type/${type}`);
  },

  async create(data: CreateWorkData): Promise<{ portfolioItem?: Work; portfolioItems?: Work[]; message: string }> {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("type", data.type);
    formData.append("category", data.category);

    if (data.description) formData.append("description", data.description);
    if (data.clientName) formData.append("clientName", data.clientName);
    if (data.companyId) formData.append("companyId", data.companyId);
    if (data.websiteUrl) formData.append("websiteUrl", data.websiteUrl);

    // رفع ملف واحد (للريلز، اللوجو، الموقع)
    if (data.file) {
      formData.append("media", data.file);
    }

    // رفع ملفات متعددة (للسوشال ميديا)
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("media", file);
      });
    }

    return fetchAPI("/api/portfolio", {
      method: "POST",
      body: formData,
    });
  },

  async update(id: string, data: Partial<CreateWorkData>): Promise<{ portfolioItem: Work }> {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.type) formData.append("type", data.type);
    if (data.category) formData.append("category", data.category);
    if (data.clientName !== undefined) formData.append("clientName", data.clientName);
    if (data.companyId !== undefined) formData.append("companyId", data.companyId);
    if (data.websiteUrl !== undefined) formData.append("websiteUrl", data.websiteUrl);

    // رفع ملف جديد
    if (data.file) {
      formData.append("media", data.file);
    }

    // رفع ملفات جديدة
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append("media", file);
      });
    }

    return fetchAPI(`/api/portfolio/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI(`/api/portfolio/${id}`, {
      method: "DELETE",
    });
  },
};

export { ApiError };
