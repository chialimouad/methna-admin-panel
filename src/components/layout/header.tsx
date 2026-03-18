import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'User Management',
  '/reports': 'Reports',
  '/photos': 'Photo Moderation',
  '/analytics': 'Analytics',
  '/trust-safety': 'Trust & Safety',
  '/security': 'Security',
}

export function Header() {
  const location = useLocation()
  const { user } = useAuth()

  const title = Object.entries(pageTitles).find(
    ([path]) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  )?.[1] || 'Admin Panel'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="hidden sm:inline-flex">
          {user?.role?.toUpperCase()}
        </Badge>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline-block">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>
    </header>
  )
}
