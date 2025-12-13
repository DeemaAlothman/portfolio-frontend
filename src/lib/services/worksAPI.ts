const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type WorkType = "LOGO" | "WEBSITE" | "SOCIAL_MEDIA" | "REEL";
export type WorkStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ClientType = "COMPANY" | "INDIVIDUAL";

export interface Work {
  id: string;
  clientId: string;
  type: WorkType;
  status: WorkStatus;
  title: string;
  slug: string;
  shortDesc?: string;
  heroSubtitle?: string;
  publishDate?: string;
  visitUrl?: string;
  isFeatured: boolean;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  category?: string;
  sortOrder: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    type: ClientType;
  };
  media?: Media[];
  tags?: WorkTag[];
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

export interface WorkTag {
  tag: {
    id: string;
    name: string;
  };
}

export interface WorksFilters {
  status?: WorkStatus;
  type?: WorkType;
  clientId?: string;
  clientType?: ClientType;
}

export interface CreateWorkData {
  clientId: string;
  type: WorkType;
  status?: WorkStatus;
  title: string;
  shortDesc?: string;
  heroSubtitle?: string;
  publishDate?: string;
  visitUrl?: string;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  tagIds?: string[];
  file?: File;
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

    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.clientId) params.append("clientId", filters.clientId);
    if (filters?.clientType) params.append("clientType", filters.clientType);

    const queryString = params.toString();
    const endpoint = queryString ? `/works?${queryString}` : "/works";

    return fetchAPI(endpoint);
  },

  async getBySlug(slug: string): Promise<Work> {
    return fetchAPI(`/works/${slug}`);
  },

  async getById(id: string): Promise<Work> {
    return fetchAPI(`/works/id/${id}`);
  },

  async create(data: CreateWorkData): Promise<Work> {
    const formData = new FormData();

    formData.append("clientId", data.clientId);
    formData.append("type", data.type);
    formData.append("title", data.title);

    if (data.status) formData.append("status", data.status);
    if (data.shortDesc) formData.append("shortDesc", data.shortDesc);
    if (data.heroSubtitle) formData.append("heroSubtitle", data.heroSubtitle);
    if (data.publishDate) formData.append("publishDate", data.publishDate);
    if (data.visitUrl) formData.append("visitUrl", data.visitUrl);
    if (data.isFeatured !== undefined) formData.append("isFeatured", String(data.isFeatured));
    if (data.seoTitle) formData.append("seoTitle", data.seoTitle);
    if (data.seoDescription) formData.append("seoDescription", data.seoDescription);
    if (data.seoKeywords) formData.append("seoKeywords", data.seoKeywords);

    if (data.tagIds && data.tagIds.length > 0) {
      formData.append("tagIds", JSON.stringify(data.tagIds));
    }

    if (data.file) {
      formData.append("file", data.file);
    }

    return fetchAPI("/works", {
      method: "POST",
      body: formData,
    });
  },

  async update(id: string, data: Partial<CreateWorkData>): Promise<Work> {
    return fetchAPI(`/works/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI(`/works/${id}`, {
      method: "DELETE",
    });
  },
};

export { ApiError };
