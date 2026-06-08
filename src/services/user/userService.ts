import { getSession, updateStoredUser } from '@/services/auth/authService'
import type { UserProfile } from '@/services/auth/types'

export function getCurrentUser(): UserProfile | null {
  return getSession()?.user ?? null
}

export function updateProfile(patch: Partial<UserProfile>): UserProfile | null {
  return updateStoredUser(patch)
}

export function displayName(user: UserProfile): string {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}
