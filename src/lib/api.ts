const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export interface SEOConfig {
  id?: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage?: string;
  twitterHandle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

export interface SiteConfig {
  id?: string;
  siteName: string;
  siteDescription?: string;
  email?: string;
  phone?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  whatsappNumber?: string;
  footerText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ContactStatus = "UNREAD" | "READ" | "ARCHIVED";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmissionsResponse {
  count: number;
  submissions: ContactSubmission[];
}

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

export interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
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
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await fetchAPI("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const data = await fetchAPI("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  async getMe(): Promise<{ admin: User }> {
    return fetchAPI("/api/auth/me");
  },

  logout() {
    localStorage.removeItem("token");
  },
};

export const seoAPI = {
  // Public: جلب إعدادات SEO
  async getConfig(): Promise<{ seoConfig: SEOConfig }> {
    return fetchAPI("/api/seo/config");
  },

  // Admin: تحديث إعدادات SEO
  async updateConfig(data: Partial<SEOConfig>): Promise<{ seoConfig: SEOConfig }> {
    return fetchAPI("/api/seo/config", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Public: جلب metadata لعمل بورتفوليو
  async getPortfolioMetadata(slug: string): Promise<SEOMetadata> {
    return fetchAPI(`/api/seo/metadata/portfolio/${slug}`);
  },

  // Public: جلب metadata لشركة
  async getCompanyMetadata(slug: string): Promise<SEOMetadata> {
    return fetchAPI(`/api/seo/metadata/company/${slug}`);
  },

  // Public: جلب sitemap.xml
  async getSitemap(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/seo/sitemap.xml`);
    return response.text();
  },

  // Public: جلب robots.txt
  async getRobotsTxt(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/seo/robots.txt`);
    return response.text();
  },
};

export const configAPI = {
  // Public: جلب إعدادات الموقع
  async getConfig(): Promise<{ config: SiteConfig }> {
    return fetchAPI("/api/config");
  },

  // Admin: تحديث إعدادات الموقع
  async updateConfig(data: Partial<SiteConfig>): Promise<{ config: SiteConfig }> {
    return fetchAPI("/api/config", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

export const contactAPI = {
  // Public: إرسال رسالة تواصل
  async submitContact(data: CreateContactData): Promise<{ submission: ContactSubmission }> {
    return fetchAPI("/api/contact", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Admin: جلب جميع رسائل التواصل
  async getAllSubmissions(filters?: {
    status?: ContactStatus;
    limit?: number;
    offset?: number;
  }): Promise<ContactSubmissionsResponse> {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/contact/submissions?${queryString}` : "/api/contact/submissions";

    return fetchAPI(endpoint);
  },

  // Admin: جلب رسالة محددة
  async getSubmissionById(id: string): Promise<{ submission: ContactSubmission }> {
    return fetchAPI(`/api/contact/submissions/${id}`);
  },

  // Admin: جلب إحصائيات الرسائل
  async getStats(): Promise<{ stats: ContactStats }> {
    return fetchAPI("/api/contact/submissions/stats");
  },

  // Admin: تحديث حالة رسالة
  async updateStatus(id: string, status: ContactStatus): Promise<{ submission: ContactSubmission }> {
    return fetchAPI(`/api/contact/submissions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  // Admin: حذف رسالة
  async deleteSubmission(id: string): Promise<{ message: string }> {
    return fetchAPI(`/api/contact/submissions/${id}`, {
      method: "DELETE",
    });
  },
};

export { ApiError };
