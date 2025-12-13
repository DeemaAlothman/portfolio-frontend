// src/lib/services/mediaAPI.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type MediaType = "IMAGE" | "VIDEO";

export interface Media {
  id: string;
  workId: string;
  sectionId?: string | null;
  fileType: MediaType;
  fileUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface UploadImageData {
  workId: string;
  sectionId?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  file: File;
}

export interface UploadVideoData {
  workId: string;
  altText?: string;
  sortOrder?: number;
  file: File;
}

export interface UpdateMediaData {
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
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
      errorData.error || "Something went wrong"
    );
  }

  return response.json();
}

export const mediaAPI = {
  // ✅ رفع صورة إضافية لعمل
  async uploadImage(data: UploadImageData): Promise<Media> {
    const formData = new FormData();
    formData.append("workId", data.workId);
    formData.append("file", data.file);

    if (data.sectionId) {
      formData.append("sectionId", data.sectionId);
    }
    if (data.altText) {
      formData.append("altText", data.altText);
    }
    if (data.isPrimary !== undefined) {
      formData.append("isPrimary", String(data.isPrimary));
    }
    if (data.sortOrder !== undefined) {
      formData.append("sortOrder", String(data.sortOrder));
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/media/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || "Failed to upload image"
      );
    }

    return response.json();
  },

  // ✅ رفع فيديو (ريلز) لعمل
  async uploadVideo(data: UploadVideoData): Promise<Media> {
    const formData = new FormData();
    formData.append("workId", data.workId);
    formData.append("file", data.file);

    if (data.altText) {
      formData.append("altText", data.altText);
    }
    if (data.sortOrder !== undefined) {
      formData.append("sortOrder", String(data.sortOrder));
    }

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/media/reel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || "Failed to upload video"
      );
    }

    return response.json();
  },

  // ✅ جلب كل الميديا لعمل معين
  async getMediaForWork(workId: string): Promise<Media[]> {
    return fetchWithAuth(`${API_URL}/media/work/${workId}`);
  },

  // ✅ تعديل بيانات media
  async update(id: string, data: UpdateMediaData): Promise<Media> {
    return fetchWithAuth(`${API_URL}/media/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  // ✅ حذف media
  async delete(id: string): Promise<{ message: string }> {
    return fetchWithAuth(`${API_URL}/media/${id}`, {
      method: "DELETE",
    });
  },
};
