// User type from backend
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string; // ชื่อแสดงสุ่มจากระบบ
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth state for Zustand store
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;
}

// API Responses
export interface AuthMeResponse {
  success: boolean;
  data: User;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  error?: string;
}
