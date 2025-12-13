// src/lib/services/contactAPI.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SubmissionsResponse {
  success: boolean;
  data: ContactSubmission[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
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

  return response.json();
}

export const contactAPI = {
  // ✅ جلب جميع رسائل التواصل (Admin)
  async getSubmissions(
    isRead?: boolean,
    limit = 50,
    offset = 0
  ): Promise<SubmissionsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (isRead !== undefined) {
      params.append("isRead", isRead.toString());
    }

    return fetchWithAuth(`${API_URL}/api/contact/submissions?${params}`);
  },

  // ✅ تحديد رسالة كمقروءة (Admin)
  async markAsRead(id: string): Promise<ContactSubmission> {
    const response = await fetchWithAuth(
      `${API_URL}/api/contact/submissions/${id}/read`,
      {
        method: "PATCH",
      }
    );
    return response.data;
  },

  // ✅ حذف رسالة (Admin)
  async delete(id: string): Promise<{ message: string }> {
    return fetchWithAuth(`${API_URL}/api/contact/submissions/${id}`, {
      method: "DELETE",
    });
  },
};
