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
  user: {
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

  async getMe(): Promise<User> {
    return fetchAPI("/api/auth/me");
  },

  logout() {
    localStorage.removeItem("token");
  },
};

export { ApiError };
