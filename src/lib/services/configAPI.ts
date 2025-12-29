// src/lib/services/configAPI.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface PortfolioConfig {
  id?: string;
  // Site Info
  siteName: string;
  siteDescription?: string | null;
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
  whatsappNumber?: string | null;
  // Footer
  footerText?: string | null;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateConfigData {
  // Site Info
  siteName?: string;
  siteDescription?: string;
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
  whatsappNumber?: string;
  // Footer
  footerText?: string;
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
  // Public: جلب إعدادات الموقع
  async get(): Promise<PortfolioConfig> {
    const response = await fetchWithAuth(`${API_URL}/api/config`);
    // Backend يرجع { config: {...} }
    return response.config || response;
  },

  // Admin: تحديث إعدادات الموقع
  async update(data: UpdateConfigData): Promise<PortfolioConfig> {
    const response = await fetchWithAuth(`${API_URL}/api/config`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    // Backend يرجع { config: {...} }
    return response.config || response;
  },
};
