import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jordan-backend-production.up.railway.app/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — attempt refresh or redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        localStorage.setItem('access_token', data.accessToken)
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken)
        }

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api

// ── Auth ─────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
}

// ── Admin ────────────────────────────────────────────────────

export const adminApi = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),

  // Users
  getUsers: (page = 1, limit = 20, status?: string) =>
    api.get('/admin/users', { params: { page, limit, status } }),
  getUserDetail: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: string) =>
    api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Reports
  getReports: (page = 1, limit = 20, status?: string) =>
    api.get('/admin/reports', { params: { page, limit, status } }),
  resolveReport: (id: string, status: string, moderatorNote?: string) =>
    api.patch(`/admin/reports/${id}`, { status, moderatorNote }),

  // Photos
  getPendingPhotos: (page = 1, limit = 20) =>
    api.get('/admin/photos/pending', { params: { page, limit } }),
  moderatePhoto: (id: string, status: string, moderationNote?: string) =>
    api.patch(`/admin/photos/${id}/moderate`, { status, moderationNote }),
}

// ── Analytics ────────────────────────────────────────────────

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getDau: (date?: string) => api.get('/analytics/dau', { params: { date } }),
  getConversion: (days = 30) =>
    api.get('/analytics/conversion', { params: { days } }),
  getRetention: (cohortDays = 7) =>
    api.get('/analytics/retention', { params: { cohortDays } }),
  getMatchesOverTime: (days = 30) =>
    api.get('/analytics/matches-over-time', { params: { days } }),
}

// ── Trust & Safety ───────────────────────────────────────────

export const trustSafetyApi = {
  getFlags: (page = 1, limit = 20) =>
    api.get('/trust-safety/admin/flags', { params: { page, limit } }),
  resolveFlag: (id: string, status: string, note?: string) =>
    api.patch(`/trust-safety/admin/flags/${id}`, { status, note }),
  shadowBan: (userId: string) =>
    api.post(`/trust-safety/admin/shadow-ban/${userId}`),
  removeShadowBan: (userId: string) =>
    api.post(`/trust-safety/admin/remove-shadow-ban/${userId}`),
  detectSuspicious: (userId: string) =>
    api.post(`/trust-safety/admin/detect-suspicious/${userId}`),
}

// ── Security ─────────────────────────────────────────────────

export const securityApi = {
  getBlacklist: () => api.get('/security/admin/blacklist'),
  addToBlacklist: (domain: string, reason: string) =>
    api.post('/security/admin/blacklist', { domain, reason }),
  removeFromBlacklist: (domain: string) =>
    api.delete(`/security/admin/blacklist/${domain}`),
}
