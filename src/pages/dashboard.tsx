import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, analyticsApi } from '@/lib/api'
import { StatsCard } from '@/components/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { DashboardStats } from '@/types'
import {
  Users,
  UserCheck,
  Heart,
  MessageSquare,
  ImageIcon,
  Flag,
  Crown,
  TrendingUp,
  Activity,
  Loader2,
  ArrowRight,
  Eye,
  Shield,
  Headphones,
  Bell,
  Camera,
  BarChart3,
  Zap,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts'

const PIE_COLORS = ['#2D7A4F', '#f59e0b', '#ef4444', '#6b7280', '#8b5cf6']

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [matchesOverTime, setMatchesOverTime] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.getStats().catch(() => ({ data: null })),
      analyticsApi.getDashboard().catch(() => ({ data: null })),
      analyticsApi.getMatchesOverTime(14).catch(() => ({ data: [] })),
    ])
      .then(([statsRes, analyticsRes, matchesRes]) => {
        setStats(statsRes.data)
        setAnalytics(analyticsRes.data)
        setMatchesOverTime(matchesRes.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center text-muted-foreground">Failed to load dashboard stats.</div>
  }

  const userStatusData = [
    { name: 'Active', value: stats.users.active },
    { name: 'Suspended', value: stats.users.suspended },
    { name: 'Banned', value: stats.users.banned },
    { name: 'Other', value: Math.max(0, stats.users.total - stats.users.active - stats.users.suspended - stats.users.banned) },
  ].filter(d => d.value > 0)

  const growthData = [
    { name: 'This Week', users: stats.users.newThisWeek },
    { name: 'This Month', users: stats.users.newThisMonth },
    { name: 'Total', users: stats.users.total },
  ]

  const conversionRate = parseFloat(stats.revenue.conversionRate) || 0

  // Quick action cards
  const quickActions = [
    { label: 'Pending Reports', value: stats.reports.pending, icon: Flag, color: 'text-red-500 bg-red-50', to: '/reports' },
    { label: 'Pending Photos', value: stats.content.pendingPhotos, icon: Camera, color: 'text-amber-500 bg-amber-50', to: '/verification' },
    { label: 'Support Tickets', value: '—', icon: Headphones, color: 'text-blue-500 bg-blue-50', to: '/support' },
    { label: 'Send Notification', value: '', icon: Bell, color: 'text-purple-500 bg-purple-50', to: '/send-notifications' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your platform today.</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/analytics')} className="gap-2">
              <BarChart3 className="h-4 w-4" /> Full Analytics
            </Button>
            <Button size="sm" onClick={() => navigate('/users')} className="gap-2">
              <Users className="h-4 w-4" /> Manage Users
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.users.total.toLocaleString()}
          subtitle={`+${stats.users.newThisWeek} this week`}
          icon={Users}
          trend={{ value: stats.users.newThisWeek > 0 ? Math.round((stats.users.newThisWeek / Math.max(stats.users.total, 1)) * 100) : 0, label: 'this week' }}
        />
        <StatsCard
          title="Active Users"
          value={stats.users.active.toLocaleString()}
          subtitle={`${((stats.users.active / Math.max(stats.users.total, 1)) * 100).toFixed(1)}% of total`}
          icon={UserCheck}
          iconColor="text-emerald-600"
        />
        <StatsCard
          title="Total Matches"
          value={stats.content.totalMatches.toLocaleString()}
          icon={Heart}
          iconColor="text-pink-500"
        />
        <StatsCard
          title="Total Messages"
          value={stats.content.totalMessages.toLocaleString()}
          icon={MessageSquare}
          iconColor="text-blue-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Likes"
          value={stats.content.totalLikes.toLocaleString()}
          icon={TrendingUp}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Premium Users"
          value={stats.revenue.premiumUsers}
          subtitle={`${stats.revenue.conversionRate} conversion`}
          icon={Crown}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Total Photos"
          value={stats.content.totalPhotos.toLocaleString()}
          subtitle={`${stats.content.pendingPhotos} pending`}
          icon={ImageIcon}
          iconColor="text-purple-500"
        />
        <StatsCard
          title="Profiles"
          value={stats.content.totalProfiles.toLocaleString()}
          icon={Activity}
          iconColor="text-cyan-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Matches Over Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Matches (Last 14 Days)</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')} className="text-xs gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {matchesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={matchesOverTime}>
                  <defs>
                    <linearGradient id="matchGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#ec4899" fill="url(#matchGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-60 items-center justify-center text-muted-foreground text-sm">No match data available</div>
            )}
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">User Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {userStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement & Revenue Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Engagement Metrics */}
        {analytics && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">DAU</span>
                <span className="text-lg font-bold">{analytics.engagement?.dau?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">WAU</span>
                <span className="text-lg font-bold">{analytics.engagement?.wau?.toLocaleString() ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">MAU</span>
                <span className="text-lg font-bold">{analytics.engagement?.mau?.toLocaleString() ?? '—'}</span>
              </div>
              {analytics.retention && (
                <>
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Retention</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Day 1', value: analytics.retention.day1 },
                        { label: 'Day 3', value: analytics.retention.day3 },
                        { label: 'Day 7', value: analytics.retention.day7 },
                        { label: 'Day 30', value: analytics.retention.day30 },
                      ].map((r) => (
                        <div key={r.label} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-12">{r.label}</span>
                          <Progress value={parseFloat(r.value) || 0} className="flex-1 h-1.5" />
                          <span className="text-xs font-semibold w-10 text-right">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conversion & Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" /> Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.revenue.premiumUsers}</p>
              <p className="text-xs text-amber-700 mt-1">Premium / Elite Subscribers</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">Conversion Rate</span>
                <span className="text-sm font-bold">{stats.revenue.conversionRate}</span>
              </div>
              <Progress value={conversionRate} className="h-2" />
            </div>
            {analytics?.matching && (
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Like→Match Rate</span>
                  <span className="text-xs font-bold">{analytics.matching.conversionRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Likes (30d)</span>
                  <span className="text-xs font-bold">{analytics.matching.totalLikes?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Matches (30d)</span>
                  <span className="text-xs font-bold">{analytics.matching.totalMatches?.toLocaleString()}</span>
                </div>
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/subscriptions')}>
              Manage Subscriptions <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* New Registrations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">New Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="users" fill="#2D7A4F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold text-emerald-600">+{stats.users.newThisWeek}</p>
                <p className="text-[10px] text-muted-foreground">This Week</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-lg font-bold text-blue-600">+{stats.users.newThisMonth}</p>
                <p className="text-[10px] text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const [textColor, bgColor] = action.color.split(' ')
            return (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                className="flex items-center gap-3 rounded-xl border p-4 text-left hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className={`rounded-lg p-2.5 ${bgColor} group-hover:scale-110 transition-transform`}>
                  <action.icon className={`h-5 w-5 ${textColor}`} />
                </div>
                <div>
                  {action.value !== '' && action.value !== '—' && (
                    <p className="text-xl font-bold">{action.value}</p>
                  )}
                  {action.value === '—' && <p className="text-xl font-bold">—</p>}
                  <p className="text-xs text-muted-foreground">{action.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" /> Platform Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Banned Users</p>
              <p className="text-xl font-bold text-red-600">{stats.users.banned}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Suspended</p>
              <p className="text-xl font-bold text-amber-600">{stats.users.suspended}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pending Reports</p>
              <p className="text-xl font-bold text-red-500">{stats.reports.pending}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Pending Photos</p>
              <p className="text-xl font-bold text-amber-500">{stats.content.pendingPhotos}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Active Rate</p>
              <p className="text-xl font-bold text-emerald-600">
                {((stats.users.active / Math.max(stats.users.total, 1)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
