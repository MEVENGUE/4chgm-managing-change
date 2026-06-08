import type { WorkspaceView } from '@/lib/workspaces'

/**
 * RBAC foundations. Module access is keyed by workspace view today; this maps
 * cleanly onto real roles/permissions when an auth backend is introduced.
 * `'*'` grants access to every module.
 */
export const MODULE_ACCESS: Record<WorkspaceView, string[]> = {
  executive: ['*'],
  engineering: [
    '/dashboard',
    '/dashboard/ai',
    '/dashboard/knowledge',
    '/dashboard/projects',
    '/dashboard/scrum',
    '/dashboard/devops',
    '/dashboard/analytics',
    '/dashboard/roadmap',
    '/dashboard/mermaid',
    '/dashboard/risks',
    '/dashboard/integrations',
    '/dashboard/pipelines',
    '/dashboard/settings',
  ],
  transformation: [
    '/dashboard',
    '/dashboard/ai',
    '/dashboard/knowledge',
    '/dashboard/projects',
    '/dashboard/transformation',
    '/dashboard/scrum',
    '/dashboard/analytics',
    '/dashboard/roadmap',
    '/dashboard/mermaid',
    '/dashboard/risks',
    '/dashboard/team',
    '/dashboard/settings',
  ],
  finance: [
    '/dashboard',
    '/dashboard/ai',
    '/dashboard/knowledge',
    '/dashboard/projects',
    '/dashboard/analytics',
    '/dashboard/cost',
    '/dashboard/roadmap',
    '/dashboard/risks',
    '/dashboard/integrations',
    '/dashboard/settings',
  ],
}

export function canAccess(view: WorkspaceView, href: string): boolean {
  const allowed = MODULE_ACCESS[view]
  if (allowed.includes('*')) return true
  return allowed.some((a) => href === a || href.startsWith(`${a}/`))
}
