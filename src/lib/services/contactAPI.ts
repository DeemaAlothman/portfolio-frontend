// src/lib/services/contactAPI.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ContactStatus = "UNREAD" | "READ" | "ARCHIVED";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: ContactStatus;
  isRead: boolean; // للتوافق مع الكود القديم
  createdAt: string;
  updatedAt: string;
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

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
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
  // Admin: جلب جميع رسائل التواصل
  async getSubmissions(
    isRead?: boolean,
    limit = 50,
    offset = 0
  ): Promise<SubmissionsResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Backend الجديد يستخدم status بدل isRead
    if (isRead !== undefined) {
      params.append("status", isRead ? "READ" : "UNREAD");
    }

    const response = await fetchWithAuth(`${API_URL}/api/contact/submissions?${params}`);

    // تحويل status إلى isRead للتوافق مع الكود القديم
    if (response.submissions) {
      response.data = response.submissions.map((sub: ContactSubmission) => ({
        ...sub,
        isRead: sub.status === "READ",
      }));
      response.pagination = {
        total: response.count || 0,
        limit,
        offset,
      };
    }

    return response;
  },

  // Admin: جلب رسالة محددة
  async getById(id: string): Promise<ContactSubmission> {
    const response = await fetchWithAuth(`${API_URL}/api/contact/submissions/${id}`);
    const submission = response.submission || response;
    return {
      ...submission,
      isRead: submission.status === "READ",
    };
  },

  // Admin: جلب إحصائيات الرسائل
  async getStats(): Promise<ContactStats> {
    const response = await fetchWithAuth(`${API_URL}/api/contact/submissions/stats`);
    return response.stats || response;
  },

  // Admin: تحديد رسالة كمقروءة
  async markAsRead(id: string): Promise<ContactSubmission> {
    const response = await fetchWithAuth(
      `${API_URL}/api/contact/submissions/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: "READ" }),
      }
    );
    const submission = response.submission || response.data;
    return {
      ...submission,
      isRead: submission.status === "READ",
    };
  },

  // Admin: تحديث حالة رسالة
  async updateStatus(id: string, status: ContactStatus): Promise<ContactSubmission> {
    const response = await fetchWithAuth(
      `${API_URL}/api/contact/submissions/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
    const submission = response.submission || response;
    return {
      ...submission,
      isRead: submission.status === "READ",
    };
  },

  // Admin: حذف رسالة
  async delete(id: string): Promise<{ message: string }> {
    return fetchWithAuth(`${API_URL}/api/contact/submissions/${id}`, {
      method: "DELETE",
    });
  },

  // Public: إرسال رسالة تواصل جديدة
  async submit(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<{ submission: ContactSubmission }> {
    return fetchWithAuth(`${API_URL}/api/contact`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
