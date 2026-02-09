import { API_URL } from "./constants";

// ========== Response Types ตาม Backend Standard ==========

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorInfo {
  code: string;
  message: string;
  details?: Record<string, string[]> | null;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorInfo;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

// ========== Custom Error Class ==========

export class ApiError extends Error {
  code: string;
  details?: Record<string, string[]> | null;
  status?: number;

  constructor(error: ApiErrorInfo, status?: number) {
    super(error.message);
    this.name = "ApiError";
    this.code = error.code;
    this.details = error.details;
    this.status = status;
  }
}

// ========== Helper Functions ==========

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const authStorage = localStorage.getItem("auth-storage");
  if (!authStorage) return null;

  try {
    const { state } = JSON.parse(authStorage);
    return state?.token || null;
  } catch {
    return null;
  }
}

function buildHeaders(options?: RequestInit, includeAuth = true): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  // Handle 401 Unauthorized
  // ไม่ auto-logout ทันที - ให้ component handle error เอง
  // เพราะอาจเกิดจาก race condition หรือ hydration issue
  if (response.status === 401) {
    throw new ApiError({ code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบใหม่" }, 401);
  }

  // Handle non-OK responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (errorData?.error) {
      throw new ApiError(errorData.error, response.status);
    }
    throw new ApiError(
      { code: "UNKNOWN_ERROR", message: `Request failed: ${response.status}` },
      response.status
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ========== API Client ==========

export const apiClient = {
  /**
   * GET request - สำหรับ single item
   * Backend response: { success: true, data: T }
   * @returns T (unwrapped data)
   */
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "GET",
      headers: buildHeaders(options),
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },

  /**
   * GET request - สำหรับ paginated list
   * Backend response: { success: true, data: T[], meta: {...} }
   */
  async getPaginated<T>(
    path: string,
    options?: RequestInit
  ): Promise<{ data: T[]; meta: PaginationMeta }> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "GET",
      headers: buildHeaders(options),
    });
    const result = await handleResponse<PaginatedResponse<T>>(response);
    return { data: result.data, meta: result.meta };
  },

  /**
   * GET request - สำหรับ raw response (ไม่ unwrap)
   * ใช้เมื่อต้องการ full response object
   */
  async getRaw<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "GET",
      headers: buildHeaders(options),
    });
    return handleResponse<T>(response);
  },

  /**
   * POST request
   * Backend response: { success: true, data: T }
   * @returns T (unwrapped data)
   */
  async post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "POST",
      headers: buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },

  /**
   * POST request - ไม่มี response data
   */
  async postVoid(path: string, data?: unknown, options?: RequestInit): Promise<void> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "POST",
      headers: buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });
    await handleResponse<void>(response);
  },

  /**
   * POST request - raw response (ไม่ unwrap)
   */
  async postRaw<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "POST",
      headers: buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  /**
   * PUT request
   */
  async put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "PUT",
      headers: buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },

  /**
   * PATCH request
   */
  async patch<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "PATCH",
      headers: buildHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },

  /**
   * DELETE request - no response
   */
  async delete(path: string, options?: RequestInit): Promise<void> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "DELETE",
      headers: buildHeaders(options),
    });
    await handleResponse<void>(response);
  },

  /**
   * DELETE request - with response
   */
  async deleteWithResponse<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "DELETE",
      headers: buildHeaders(options),
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },

  /**
   * Public GET - ไม่แนบ token (สำหรับ public endpoints)
   */
  async publicGet<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "GET",
      headers: buildHeaders(options, false),
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },

  /**
   * Public GET Paginated - ไม่แนบ token
   */
  async publicGetPaginated<T>(
    path: string,
    options?: RequestInit
  ): Promise<{ data: T[]; meta: PaginationMeta }> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      method: "GET",
      headers: buildHeaders(options, false),
    });
    const result = await handleResponse<PaginatedResponse<T>>(response);
    return { data: result.data, meta: result.meta };
  },

  // ========== Server-Side Methods (สำหรับ RSC) ==========

  /**
   * Server GET - สำหรับ Server Components พร้อม Next.js cache
   * ไม่แนบ token (server-side ไม่มี localStorage)
   * @returns T (unwrapped data)
   */
  async serverGet<T>(
    path: string,
    cacheOptions?: { revalidate?: number | false; tags?: string[] }
  ): Promise<T> {
    const nextOptions: RequestInit["next"] = {};
    if (cacheOptions?.revalidate !== undefined) {
      nextOptions.revalidate = cacheOptions.revalidate;
    }
    if (cacheOptions?.tags) {
      nextOptions.tags = cacheOptions.tags;
    }

    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: nextOptions,
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },

  /**
   * Server GET Raw - สำหรับ Server Components, return full response
   */
  async serverGetRaw<T>(
    path: string,
    cacheOptions?: { revalidate?: number | false; tags?: string[] }
  ): Promise<T> {
    const nextOptions: RequestInit["next"] = {};
    if (cacheOptions?.revalidate !== undefined) {
      nextOptions.revalidate = cacheOptions.revalidate;
    }
    if (cacheOptions?.tags) {
      nextOptions.tags = cacheOptions.tags;
    }

    const response = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: nextOptions,
    });
    return handleResponse<T>(response);
  },

  /**
   * Server POST - สำหรับ Server Components (no cache)
   */
  async serverPost<T>(path: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
      cache: "no-store",
    });
    const result = await handleResponse<ApiResponse<T>>(response);
    return result.data;
  },
};

// Re-export types for convenience
export type { PaginationMeta as Meta };
