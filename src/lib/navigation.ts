import {
  LayoutDashboard,
  Bot,
  RefreshCw,
  FolderKanban,
  Kanban,
  GitBranch,
  BarChart3,
  Map,
  Workflow,
  Share2,
  DollarSign,
  ShieldAlert,
  Users,
  Plug,
  Settings,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  key: string
  href: string
  icon: LucideIcon
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.aiCopilot', href: '/dashboard/ai', icon: Bot, badge: 'BETA' },
  { key: 'nav.knowledge', href: '/dashboard/knowledge', icon: BookOpen },
  { key: 'nav.projects', href: '/dashboard/projects', icon: FolderKanban },
  { key: 'nav.transformation', href: '/dashboard/transformation', icon: RefreshCw },
  { key: 'nav.scrumHub', href: '/dashboard/scrum', icon: Kanban },
  { key: 'nav.devopsFlow', href: '/dashboard/devops', icon: GitBranch },
  { key: 'nav.analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { key: 'nav.roadmap', href: '/dashboard/roadmap', icon: Map },
  { key: 'nav.mermaidStudio', href: '/dashboard/mermaid', icon: Workflow, badge: 'BETA' },
  { key: 'nav.costForecast', href: '/dashboard/cost', icon: DollarSign },
  { key: 'nav.risksImpact', href: '/dashboard/risks', icon: ShieldAlert },
  { key: 'nav.teamCulture', href: '/dashboard/team', icon: Users },
  { key: 'nav.integrations', href: '/dashboard/integrations', icon: Plug },
  { key: 'nav.pipelines', href: '/dashboard/pipelines', icon: Share2 },
  { key: 'nav.settings', href: '/dashboard/settings', icon: Settings },
]

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}
