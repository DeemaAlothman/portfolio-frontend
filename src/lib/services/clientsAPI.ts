const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ClientType = "COMPANY" | "INDIVIDUAL";

export interface Client {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string; // الباك إند يرجع logo (مش logoUrl) - URL كامل
  logoUrl?: string; // للتوافق مع الكود القديم
  createdAt: string;
  updatedAt: string;
}

export interface ClientsFilters {
  type?: ClientType;
}

export interface CreateClientData {
  name: string;
  description?: string;
  website?: string;
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
    const endpoint = queryString ? `/api/companies?${queryString}` : "/api/companies";

    const response = await fetchAPI(endpoint);

    // إذا الباك راجع object فيه companies
    if (response && response.companies) {
      return response.companies;
    }

    // إذا راجع array مباشرة
    return Array.isArray(response) ? response : [];
  },

  async getBySlug(slug: string): Promise<Client> {
    return fetchAPI(`/api/companies/${slug}`);
  },

  async getById(id: string): Promise<Client> {
    // الباك إند يستخدم /api/companies/:id مش /api/companies/id/:id
    const response = await fetchAPI(`/api/companies/${id}`);

    // إذا الباك راجع object فيه company
    if (response && response.company) {
      return response.company;
    }

    // إذا راجع object مباشرة
    return response;
  },

  async create(data: CreateClientData): Promise<{ company: Client }> {
    const formData = new FormData();

    formData.append("name", data.name);

    if (data.description) formData.append("description", data.description);
    if (data.website) formData.append("website", data.website);

    if (data.logo) {
      formData.append("logo", data.logo);
    }

    return fetchAPI("/api/companies", {
      method: "POST",
      body: formData,
    });
  },

  async update(id: string, data: Partial<CreateClientData>): Promise<{ company: Client }> {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.website !== undefined) formData.append("website", data.website);

    if (data.logo) {
      formData.append("logo", data.logo);
    }

    return fetchAPI(`/api/companies/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI(`/api/companies/${id}`, {
      method: "DELETE",
    });
  },
};

export { ApiError };
