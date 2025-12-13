// src/lib/services/configAPI.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PortfolioConfig {
  id: number;
  // Hero Section
  heroTitle: string;
  heroSubtitle?: string | null;
  heroDescription?: string | null;
  // About Section
  aboutTitle?: string | null;
  aboutDescription?: string | null;
  // Contact Info
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  // Social Media
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  // Theme Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string | null;
  // SEO
  siteName: string;
  siteDescription?: string | null;
  siteKeywords?: string | null;
  updatedAt: string;
}

export interface UpdateConfigData {
  // Hero Section
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  // About Section
  aboutTitle?: string;
  aboutDescription?: string;
  // Contact Info
  email?: string;
  phone?: string;
  address?: string;
  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  // Theme Colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  // SEO
  siteName?: string;
  siteDescription?: string;
  siteKeywords?: string;
}

export interface UpdateColorsData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface UpdateContactData {
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSocialData {
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

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

export const configAPI = {
  // ✅ جلب إعدادات الموقع (Public)
  async get(): Promise<PortfolioConfig> {
    return fetchWithAuth(`${API_URL}/api/config`);
  },

  // ✅ تحديث جميع الإعدادات (Admin)
  async update(data: UpdateConfigData): Promise<PortfolioConfig> {
    return fetchWithAuth(`${API_URL}/api/config`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // ✅ تحديث ألوان الثيم فقط (Admin)
  async updateColors(data: UpdateColorsData): Promise<PortfolioConfig> {
    return fetchWithAuth(`${API_URL}/api/config/colors`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // ✅ تحديث معلومات التواصل فقط (Admin)
  async updateContact(data: UpdateContactData): Promise<PortfolioConfig> {
    return fetchWithAuth(`${API_URL}/api/config/contact`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // ✅ تحديث روابط التواصل الاجتماعي فقط (Admin)
  async updateSocial(data: UpdateSocialData): Promise<PortfolioConfig> {
    return fetchWithAuth(`${API_URL}/api/config/social`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
