import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { StatsCard } from '@/components/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DashboardStats } from '@/types'
import {
  Users,
  UserCheck,
  UserX,
  Heart,
  MessageSquare,
  ImageIcon,
  Flag,
  Crown,
  TrendingUp,
  Activity,
  Loader2,
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
} from 'recharts'

const PIE_COLORS = ['#2D7A4F', '#f59e0b', '#ef4444', '#6b7280']

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
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
    { name: 'Other', value: stats.users.total - stats.users.active - stats.users.suspended - stats.users.banned },
  ].filter(d => d.value > 0)

  const growthData = [
    { name: 'This Week', users: stats.users.newThisWeek },
    { name: 'This Month', users: stats.users.newThisMonth },
  ]

  return (
    <div className="space-y-6">
      {/* Top-level stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.users.total.toLocaleString()}
          subtitle={`+${stats.users.newThisWeek} this week`}
          icon={Users}
        />
        <StatsCard
          title="Active Users"
          value={stats.users.active.toLocaleString()}
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

      {/* Second row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Likes"
          value={stats.content.totalLikes.toLocaleString()}
          icon={TrendingUp}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Pending Reports"
          value={stats.reports.pending}
          icon={Flag}
          iconColor="text-red-500"
        />
        <StatsCard
          title="Pending Photos"
          value={stats.content.pendingPhotos}
          icon={ImageIcon}
          iconColor="text-amber-500"
        />
        <StatsCard
          title="Premium Users"
          value={stats.revenue.premiumUsers}
          subtitle={`${stats.revenue.conversionRate} conversion`}
          icon={Crown}
          iconColor="text-amber-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {userStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#2D7A4F" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total Photos</p>
              <p className="text-2xl font-bold">{stats.content.totalPhotos.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Profiles Created</p>
              <p className="text-2xl font-bold">{stats.content.totalProfiles.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Banned Users</p>
              <p className="text-2xl font-bold text-red-600">{stats.users.banned}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">New This Month</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.users.newThisMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
