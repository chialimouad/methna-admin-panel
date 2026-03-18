import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Users,
  Flag,
  ImageIcon,
  BarChart3,
  Shield,
  Lock,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Bell,
  Search,
  CreditCard,
  Target,
  Activity,
  Headphones,
  Megaphone,
  Crown,
  Send,
} from 'lucide-react'
import { useState } from 'react'

const navSections = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Users & Content',
    items: [
      { to: '/users', label: 'Users', icon: Users },
      { to: '/search', label: 'Search & Discovery', icon: Search },
      { to: '/reports', label: 'Reports', icon: Flag },
      { to: '/photos', label: 'Photo Moderation', icon: ImageIcon },
    ],
  },
  {
    title: 'Social',
    items: [
      { to: '/activity', label: 'Activity Monitor', icon: Activity },
      { to: '/matches', label: 'Matches', icon: Heart },
      { to: '/matching', label: 'Matching Engine', icon: Target },
      { to: '/chat', label: 'Chat Moderation', icon: MessageSquare },
    ],
  },
  {
    title: 'Communication',
    items: [
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/send-notifications', label: 'Send Notifications', icon: Send },
      { to: '/support', label: 'Support Desk', icon: Headphones },
    ],
  },
  {
    title: 'Business',
    items: [
      { to: '/subscriptions', label: 'Subscriptions', icon: Crown },
      { to: '/monetization', label: 'Monetization', icon: CreditCard },
      { to: '/ads', label: 'Ad Management', icon: Megaphone },
    ],
  },
  {
    title: 'Safety & Security',
    items: [
      { to: '/trust-safety', label: 'Trust & Safety', icon: Shield },
      { to: '/security', label: 'Security', icon: Lock },
    ],
  },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Heart className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Methna</span>
            <span className="text-[10px] text-sidebar-foreground/60">Admin Panel</span>
          </div>
        )}
      </div>

      <Separator className="bg-sidebar-accent" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title} className="mb-3">
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to))

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-white'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="bg-sidebar-accent" />

      {/* User & Collapse */}
      <div className="p-3">
        {!collapsed && user && (
          <div className="mb-3 rounded-lg bg-sidebar-accent/50 px-3 py-2">
            <p className="text-xs font-medium truncate">{user.firstName} {user.lastName}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-2 text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  )
}
