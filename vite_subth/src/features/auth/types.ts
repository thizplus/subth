import type { RoleType } from '@/constants/enums'

export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  role: RoleType
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}
