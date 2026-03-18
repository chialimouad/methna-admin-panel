import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { AdminLayout } from '@/components/layout/admin-layout'
import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import UsersPage from '@/pages/users/index'
import UserDetailPage from '@/pages/users/user-detail'
import ReportsPage from '@/pages/reports'
import PhotosPage from '@/pages/photos'
import AnalyticsPage from '@/pages/analytics'
import TrustSafetyPage from '@/pages/trust-safety'
import SecurityPage from '@/pages/security'
import MatchingPage from '@/pages/matching'
import MonetizationPage from '@/pages/monetization'
import ChatPage from '@/pages/chat'
import NotificationsPage from '@/pages/notifications'
import SearchUsersPage from '@/pages/search-users'
import MatchesPage from '@/pages/matches'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/photos" element={<PhotosPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/search" element={<SearchUsersPage />} />
            <Route path="/monetization" element={<MonetizationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/trust-safety" element={<TrustSafetyPage />} />
            <Route path="/security" element={<SecurityPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
