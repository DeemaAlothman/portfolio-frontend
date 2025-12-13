const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type SectionType =
  | "OVERVIEW"
  | "GOALS"
  | "PROCESS"
  | "RESULTS"
  | "BRAND_STORY"
  | "TECH_STACK"
  | "OTHER";

export interface WorkSection {
  id: string;
  workId: string;
  sectionType: SectionType;
  title: string;
  body: string;
  sortOrder: number;
  highlight: boolean;
  createdAt: string;
}

export interface CreateSectionData {
  sectionType: SectionType;
  title: string;
  body: string;
  sortOrder?: number;
  highlight?: boolean;
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
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
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

export const sectionsAPI = {
  // Get all sections for a work
  async getForWork(workId: string): Promise<WorkSection[]> {
    return fetchAPI(`/works/${workId}/sections`);
  },

  // Get single section by ID
  async getById(id: string): Promise<WorkSection> {
    return fetchAPI(`/sections/${id}`);
  },

  // Create section for a work
  async create(workId: string, data: CreateSectionData): Promise<WorkSection> {
    return fetchAPI(`/works/${workId}/sections`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update section
  async update(id: string, data: Partial<CreateSectionData>): Promise<WorkSection> {
    return fetchAPI(`/sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Delete section
  async delete(id: string): Promise<{ message: string }> {
    return fetchAPI(`/sections/${id}`, {
      method: "DELETE",
    });
  },
};

// Helper function to get section type label in Arabic
export function getSectionTypeLabel(type: SectionType): string {
  const labels: Record<SectionType, string> = {
    OVERVIEW: "نظرة عامة",
    GOALS: "الأهداف",
    PROCESS: "العملية",
    RESULTS: "النتائج",
    BRAND_STORY: "قصة العلامة",
    TECH_STACK: "التقنيات المستخدمة",
    OTHER: "أخرى",
  };
  return labels[type];
}

export { ApiError };
