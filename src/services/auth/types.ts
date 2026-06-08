export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  company: string
  role: string
  phone?: string
  timezone?: string
  department?: string
  bio?: string
  avatarUrl?: string
  language?: string
  createdAt: string
}

export type AuthSession = {
  token: string
  refreshToken?: string
  user: UserProfile
  expiresAt: string
  workspaceId?: string
  organizationId?: string
}

export type LoginCredentials = { email: string; password: string; remember?: boolean }
export type RegisterPayload = {
  firstName: string
  lastName: string
  username: string
  company: string
  role: string
  email: string
  password: string
}
