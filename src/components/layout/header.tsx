import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Bell,
  RefreshCw,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Shield,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'

const pageTitles: Record<string, { title: string; breadcrumb: string[] }> = {
  '/': { title: 'Dashboard', breadcrumb: ['Overview'] },
  '/analytics': { title: 'Analytics', breadcrumb: ['Overview', 'Analytics'] },
  '/users': { title: 'User Management', breadcrumb: ['Users & Content', 'All Users'] },
  '/search': { title: 'Search & Discovery', breadcrumb: ['Users & Content', 'Search'] },
  '/verification': { title: 'Verification Center', breadcrumb: ['Users & Content', 'Verification'] },
  '/photos': { title: 'Photo Moderation', breadcrumb: ['Users & Content', 'Photos'] },
  '/activity': { title: 'Activity Feed', breadcrumb: ['Social', 'Activity'] },
  '/matches': { title: 'Matches', breadcrumb: ['Social', 'Matches'] },
  '/matching': { title: 'Matching Engine', breadcrumb: ['Social', 'Matching'] },
  '/chat': { title: 'Conversations', breadcrumb: ['Social', 'Chat'] },
  '/notifications': { title: 'Notifications', breadcrumb: ['Communication', 'Notifications'] },
  '/send-notifications': { title: 'Send Push', breadcrumb: ['Communication', 'Send Push'] },
  '/support': { title: 'Support Tickets', breadcrumb: ['Communication', 'Support'] },
  '/subscriptions': { title: 'Subscriptions', breadcrumb: ['Revenue', 'Subscriptions'] },
  '/monetization': { title: 'Monetization', breadcrumb: ['Revenue', 'Monetization'] },
  '/ads': { title: 'Ad Campaigns', breadcrumb: ['Revenue', 'Ads'] },
  '/reports': { title: 'Reports', breadcrumb: ['Safety', 'Reports'] },
  '/trust-safety': { title: 'Trust & Safety', breadcrumb: ['Safety', 'Trust & Safety'] },
  '/security': { title: 'Security', breadcrumb: ['Safety', 'Security'] },
  '/audit-logs': { title: 'Audit Logs', breadcrumb: ['Safety', 'Audit Logs'] },
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  const match = Object.entries(pageTitles).find(
    ([path]) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  )
  const pageInfo = match?.[1] || { title: 'Admin Panel', breadcrumb: [] }

  // User detail breadcrumb
  const isUserDetail = location.pathname.match(/^\/users\/[^/]+$/)
  const breadcrumb = isUserDetail
    ? ['Users & Content', 'All Users', 'User Detail']
    : pageInfo.breadcrumb

  useEffect(() => {
    adminApi.getStats()
      .then((res) => {
        const stats = res.data
        setPendingCount((stats.reports?.pending || 0) + (stats.content?.pendingPhotos || 0))
      })
      .catch(() => {})
  }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-6 gap-4">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <nav className="flex items-center text-sm">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <ChevronRight className="h-3 w-3 mx-1.5 text-muted-foreground/50" />}
              <span className={i === breadcrumb.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Center: Search */}
      <form onSubmit={handleSearch} className="hidden md:flex relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users, emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
        />
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground"
          onClick={() => window.location.reload()}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground relative"
          onClick={() => navigate('/reports')}
          title="Pending items"
        >
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-semibold leading-none">{user?.firstName} {user?.lastName}</span>
                <Badge variant="outline" className="mt-0.5 h-4 px-1.5 text-[9px] font-medium">
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/security')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/audit-logs')}>
              <Shield className="mr-2 h-4 w-4" /> Audit Logs
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
