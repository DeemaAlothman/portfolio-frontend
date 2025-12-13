const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ClientType = "COMPANY" | "INDIVIDUAL";

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  slug: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientsFilters {
  type?: ClientType;
}

export interface CreateClientData {
  name: string;
  type: ClientType;
  description?: string;
  websiteUrl?: string;
  industry?: string;
  location?: string;
  logo?: File;
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

  // Don't set Content-Type for FormData
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

export const clientsAPI = {
  async getAll(filters?: ClientsFilters): Promise<Client[]> {
    const params = new URLSearchParams();

    if (filters?.type) params.append("type", filters.type);

    const queryString = params.toString();
    const endpoint = queryString ? `/clients?${queryString}` : "/clients";

    return fetchAPI(endpoint);
  },

  async getBySlug(slug: string): Promise<Client> {
    return fetchAPI(`/clients/${slug}`);
  },

  async getById(id: string): Promise<Client> {
    return fetchAPI(`/clients/id/${id}`);
  },

  async create(data: CreateClientData): Promise<Client> {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("type", data.type);

    if (data.description) formData.append("description", data.description);
    if (data.websiteUrl) formData.append("websiteUrl", data.websiteUrl);
    if (data.industry) formData.append("industry", data.industry);
    if (data.location) formData.append("location", data.location);

    if (data.logo) {
      formData.append("logo", data.logo);
    }

    return fetchAPI("/clients", {
      method: "POST",
      body: formData,
    });
  },

  async update(id: string, data: Partial<CreateClientData>): Promise<Client> {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.type) formData.append("type", data.type);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.websiteUrl !== undefined) formData.append("websiteUrl", data.websiteUrl);
    if (data.industry !== undefined) formData.append("industry", data.industry);
    if (data.location !== undefined) formData.append("location", data.location);

    if (data.logo) {
      formData.append("logo", data.logo);
    }

    return fetchAPI(`/clients/${id}`, {
      method: "PATCH",
      body: formData,
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI(`/clients/${id}`, {
      method: "DELETE",
    });
  },
};

export { ApiError };
