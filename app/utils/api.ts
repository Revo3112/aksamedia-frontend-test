import type {
  ApiResponse,
  PaginatedResponse,
  ApiUser,
  ApiEmployee,
  ApiDivision,
  User,
  CrudItem,
} from "../types";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://0.0.0.0:8080/api";

// Storage utilities
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },
  setToken: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
  },
  removeToken: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("auth_token");
  },
};

// API client matching Laravel exactly
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = tokenStorage.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    if (options.body instanceof FormData) {
      delete (config.headers as any)["Content-Type"];
    } else {
      config.headers = {
        ...config.headers,
        "Content-Type": "application/json",
      };
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);

      if (!response.ok) {
        if (response.status === 401) {
          tokenStorage.removeToken();
          window.location.href = "/login";
          throw new Error("Session expired. Please login again.");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Network error occurred");
    }
  }

  // All 7 Laravel endpoints implemented exactly
  async login(
    username: string,
    password: string
  ): Promise<ApiResponse<{ token: string; admin: ApiUser }>> {
    return this.request<ApiResponse<{ token: string; admin: ApiUser }>>(
      "/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    );
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>("/logout", {
      method: "POST",
    });
  }

  async getDivisions(params?: { name?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append("name", params.name);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/divisions?${queryString}` : "/divisions";

    return this.request<ApiResponse<{ divisions: ApiDivision[] }>>(endpoint);
  }

  async getEmployees(params?: {
    name?: string;
    division_id?: string;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.name) queryParams.append("name", params.name);
    if (params?.division_id)
      queryParams.append("division_id", params.division_id);
    if (params?.page) queryParams.append("page", params.page.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/employees?${queryString}` : "/employees";

    return this.request<PaginatedResponse<{ employees: ApiEmployee[] }>>(
      endpoint
    );
  }

  async createEmployee(data: FormData): Promise<ApiResponse> {
    return this.request<ApiResponse>("/employees", {
      method: "POST",
      body: data,
    });
  }

  async updateEmployee(id: string, data: FormData): Promise<ApiResponse> {
    data.append("_method", "PUT");
    return this.request<ApiResponse>(`/employees/${id}`, {
      method: "POST",
      body: data,
    });
  }

  async deleteEmployee(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/employees/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions
export const transformApiUserToUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  username: apiUser.username,
  fullName: apiUser.name,
  email: apiUser.email,
  phone: apiUser.phone,
});

export const transformApiEmployeeToCrudItem = (
  apiEmployee: ApiEmployee
): CrudItem => ({
  id: apiEmployee.id,
  name: apiEmployee.name,
  phone: apiEmployee.phone,
  position: apiEmployee.position,
  division: {
    id: apiEmployee.division.id,
    name: apiEmployee.division.name,
  },
  image: apiEmployee.image,
});

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};
