import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi, trustSafetyApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { UserDetail } from '@/types'
import { formatDate, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShieldOff,
  Ban,
  UserCheck,
  Crown,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    if (!id) return
    adminApi.getUserDetail(id)
      .then((res) => setDetail(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status: string) => {
    if (!id) return
    setActionLoading(status)
    try {
      await adminApi.updateUserStatus(id, status)
      const res = await adminApi.getUserDetail(id)
      setDetail(res.data.data || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  const handleShadowBan = async () => {
    if (!id) return
    setActionLoading('shadowban')
    try {
      if (detail?.user.isShadowBanned) {
        await trustSafetyApi.removeShadowBan(id)
      } else {
        await trustSafetyApi.shadowBan(id)
      }
      const res = await adminApi.getUserDetail(id)
      setDetail(res.data.data || res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!detail) {
    return <div className="text-center text-muted-foreground">User not found.</div>
  }

  const { user, profile, photos, subscription } = detail

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/users')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                {photos?.[0]?.url ? (
                  <AvatarImage src={photos[0].url} />
                ) : null}
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role?.toUpperCase()}</Badge>
                <Badge variant={user.status === 'active' ? 'success' : user.status === 'banned' ? 'destructive' : 'warning'}>
                  {user.status}
                </Badge>
                {user.selfieVerified && <Badge variant="info">Verified</Badge>}
                {user.isShadowBanned && <Badge variant="destructive">Shadow Banned</Badge>}
              </div>

              <Separator className="my-4" />

              <div className="w-full space-y-3 text-left text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Trust Score: <strong className={user.trustScore < 30 ? 'text-red-600' : user.trustScore < 60 ? 'text-amber-600' : 'text-emerald-600'}>{user.trustScore}/100</strong></span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {profile?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.city}, {profile.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.emailVerified ? 'Email verified' : 'Email not verified'}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="w-full space-y-2 text-left text-xs text-muted-foreground">
                <p>Joined: {formatDateTime(user.createdAt)}</p>
                {user.lastLoginAt && <p>Last login: {formatDateTime(user.lastLoginAt)}</p>}
                <p>Devices: {user.deviceCount}</p>
                <p>Flags: {user.flagCount}</p>
                {user.lastKnownIp && <p>Last IP: {user.lastKnownIp}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {user.status !== 'active' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('active')}
                  disabled={!!actionLoading}
                  className="gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  {actionLoading === 'active' ? 'Activating...' : 'Activate'}
                </Button>
              )}
              {user.status !== 'suspended' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('suspended')}
                  disabled={!!actionLoading}
                  className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {actionLoading === 'suspended' ? 'Suspending...' : 'Suspend'}
                </Button>
              )}
              {user.status !== 'banned' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('banned')}
                  disabled={!!actionLoading}
                  className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Ban className="h-4 w-4" />
                  {actionLoading === 'banned' ? 'Banning...' : 'Ban'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleShadowBan}
                disabled={!!actionLoading}
                className="gap-2"
              >
                {user.isShadowBanned ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                {actionLoading === 'shadowban' ? 'Processing...' : user.isShadowBanned ? 'Remove Shadow Ban' : 'Shadow Ban'}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Details */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><span className="text-xs text-muted-foreground">Gender</span><p className="font-medium capitalize">{profile.gender}</p></div>
                  <div><span className="text-xs text-muted-foreground">Date of Birth</span><p className="font-medium">{formatDate(profile.dateOfBirth)}</p></div>
                  <div><span className="text-xs text-muted-foreground">Ethnicity</span><p className="font-medium">{profile.ethnicity}</p></div>
                  <div><span className="text-xs text-muted-foreground">Nationality</span><p className="font-medium">{profile.nationality}</p></div>
                  <div><span className="text-xs text-muted-foreground">Religious Level</span><p className="font-medium">{profile.religiousLevel}</p></div>
                  <div><span className="text-xs text-muted-foreground">Marriage Intention</span><p className="font-medium">{profile.marriageIntention}</p></div>
                  <div><span className="text-xs text-muted-foreground">Completion</span><p className="font-medium">{profile.profileCompletionPercentage}%</p></div>
                  <div><span className="text-xs text-muted-foreground">Activity Score</span><p className="font-medium">{profile.activityScore}/100</p></div>
                </div>
                {profile.bio && (
                  <div className="mt-4">
                    <span className="text-xs text-muted-foreground">Bio</span>
                    <p className="mt-1 text-sm">{profile.bio}</p>
                  </div>
                )}
                {profile.interests?.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs text-muted-foreground">Interests</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.interests.map((i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {photos && photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Photos ({photos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="User photo"
                        className="aspect-square w-full rounded-lg object-cover border"
                      />
                      <div className="absolute top-1 right-1">
                        <Badge
                          variant={photo.moderationStatus === 'APPROVED' ? 'success' : photo.moderationStatus === 'REJECTED' ? 'destructive' : 'warning'}
                          className="text-[10px]"
                        >
                          {photo.moderationStatus}
                        </Badge>
                      </div>
                      {photo.isMain && (
                        <div className="absolute bottom-1 left-1">
                          <Badge variant="default" className="text-[10px]">Main</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription */}
          {subscription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" /> Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><span className="text-xs text-muted-foreground">Plan</span><p className="font-medium">{subscription.plan}</p></div>
                  <div><span className="text-xs text-muted-foreground">Status</span><p className="font-medium capitalize">{subscription.status}</p></div>
                  {subscription.endDate && <div><span className="text-xs text-muted-foreground">Expires</span><p className="font-medium">{formatDate(subscription.endDate)}</p></div>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
