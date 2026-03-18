// ── Enums ────────────────────────────────────────────────────

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DEACTIVATED = 'deactivated',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ReportReason {
  FAKE_PROFILE = 'FAKE_PROFILE',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  HARASSMENT = 'HARASSMENT',
  SPAM = 'SPAM',
  SCAM = 'SCAM',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum PhotoModerationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ContentFlagStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  DISMISSED = 'DISMISSED',
  ACTION_TAKEN = 'ACTION_TAKEN',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  GOLD = 'GOLD',
}

// ── Entities ─────────────────────────────────────────────────

export interface User {
  id: string
  username?: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  selfieVerified: boolean
  selfieUrl?: string
  notificationsEnabled: boolean
  isShadowBanned: boolean
  trustScore: number
  flagCount: number
  lastKnownIp?: string
  deviceCount: number
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface Profile {
  id: string
  userId: string
  bio?: string
  gender: Gender
  dateOfBirth: string
  ethnicity: string
  nationality: string
  city?: string
  country?: string
  religiousLevel: string
  marriageIntention: string
  interests: string[]
  languages: string[]
  isComplete: boolean
  profileCompletionPercentage: number
  activityScore: number
}

export interface Photo {
  id: string
  userId: string
  url: string
  publicId: string
  isMain: boolean
  isSelfieVerification: boolean
  order: number
  moderationStatus: PhotoModerationStatus
  moderationNote?: string
  createdAt: string
  user?: User
}

export interface Report {
  id: string
  reporterId: string
  reportedId: string
  reason: ReportReason
  details?: string
  status: ReportStatus
  moderatorNote?: string
  resolvedById?: string
  createdAt: string
  reporter?: User
  reported?: User
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: string
  startDate?: string
  endDate?: string
}

export interface ContentFlag {
  id: string
  userId: string
  type: string
  status: ContentFlagStatus
  source: string
  content?: string
  entityType: string
  entityId: string
  confidenceScore?: number
  reviewNote?: string
  createdAt: string
  user?: User
}

export interface EmailBlacklist {
  id: string
  domain: string
  reason: string
  isActive: boolean
  addedBy: string
  createdAt: string
}

// ── API Responses ────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface DashboardStats {
  users: {
    total: number
    active: number
    suspended: number
    banned: number
    newThisWeek: number
    newThisMonth: number
  }
  content: {
    totalProfiles: number
    totalMatches: number
    totalPhotos: number
    pendingPhotos: number
    totalMessages: number
    totalLikes: number
  }
  reports: {
    pending: number
  }
  revenue: {
    premiumUsers: number
    conversionRate: string
  }
}

export interface AnalyticsDashboard {
  totalUsers: number
  newUsersToday: number
  dailyActiveUsers: number
  totalMatches: number
  matchesToday: number
  totalMessages: number
  messagesToday: number
  premiumUsers: number
  conversionRate: number
  retentionRate: number
}

export interface UserDetail {
  user: User
  profile?: Profile
  photos: Photo[]
  subscription?: Subscription
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}
