import { apiClient } from '@/lib/api-client'
import { AUTH_ROUTES } from '@/constants/api-routes'
import type { LoginCredentials, AuthResponse, User } from './types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(AUTH_ROUTES.LOGIN, credentials)
  },

  async logout(): Promise<void> {
    await apiClient.postVoid(AUTH_ROUTES.LOGOUT)
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>(AUTH_ROUTES.ME)
  },
}
