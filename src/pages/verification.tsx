import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, trustSafetyApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import {
  FileCheck,
  Camera,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Shield,
  ExternalLink,
} from 'lucide-react'

interface PendingPhoto {
  id: string
  userId: string
  url: string
  moderationStatus: string
  isSelfieVerification: boolean
  isMain: boolean
  createdAt: string
  user?: { id: string; firstName: string; lastName: string; email: string; selfieVerified: boolean }
}

export default function VerificationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState('selfies')
  const [photos, setPhotos] = useState<PendingPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Action dialog
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    photo: PendingPhoto | null
    action: string
    note: string
  }>({ open: false, photo: null, action: '', note: '' })
  const [actionLoading, setActionLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })

  const fetchPhotos = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.getPendingPhotos(page, 20)
      const allPhotos: PendingPhoto[] = data.photos || data || []
      setPhotos(allPhotos)
      setTotal(data.total || 0)
      setStats((prev) => ({ ...prev, pending: data.total || 0 }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPhotos() }, [page])

  const selfiePhotos = photos.filter((p) => p.isSelfieVerification)
  const profilePhotos = photos.filter((p) => !p.isSelfieVerification)

  const handleModerate = async () => {
    if (!actionDialog.photo) return
    setActionLoading(true)
    try {
      await adminApi.moderatePhoto(
        actionDialog.photo.id,
        actionDialog.action,
        actionDialog.note || undefined
      )
      toast({
        title: actionDialog.action === 'approved' ? 'Photo Approved' : 'Photo Rejected',
        description: `Photo for ${actionDialog.photo.user?.firstName || 'user'} has been ${actionDialog.action}.`,
        variant: actionDialog.action === 'approved' ? 'success' : 'warning',
      })
      setActionDialog({ open: false, photo: null, action: '', note: '' })
      fetchPhotos()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to moderate photo', variant: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = Math.ceil(total / 20)

  const renderPhotoGrid = (items: PendingPhoto[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-400" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No pending items in this category.</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((photo) => (
          <Card key={photo.id} className="overflow-hidden group">
            <div className="relative aspect-square">
              <img
                src={photo.url}
                alt="Pending photo"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => setActionDialog({
                      open: true,
                      photo,
                      action: 'approved',
                      note: '',
                    })}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setActionDialog({
                      open: true,
                      photo,
                      action: 'rejected',
                      note: '',
                    })}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {photo.isSelfieVerification && (
                  <Badge className="bg-blue-500 text-white text-[10px]">Selfie</Badge>
                )}
                {photo.isMain && (
                  <Badge className="bg-primary text-white text-[10px]">Main</Badge>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="warning" className="text-[10px]">
                  <Clock className="h-3 w-3 mr-1" /> Pending
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                      {photo.user?.firstName?.[0]}{photo.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">
                      {photo.user?.firstName} {photo.user?.lastName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{photo.user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => navigate(`/users/${photo.userId}`)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Verification Center</h1>
        <p className="text-muted-foreground">Review selfie verifications, ID documents, and photo moderation</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2.5">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5">
              <Camera className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{selfiePhotos.length}</p>
              <p className="text-xs text-muted-foreground">Selfie Verifications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2.5">
              <FileCheck className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profilePhotos.length}</p>
              <p className="text-xs text-muted-foreground">Profile Photos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="selfies" className="gap-1.5">
            <Camera className="h-4 w-4" /> Selfie Verification
            {selfiePhotos.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{selfiePhotos.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-1.5">
            <FileCheck className="h-4 w-4" /> Profile Photos
            {profilePhotos.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{profilePhotos.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            All Pending
            {total > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">{total}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="selfies">{renderPhotoGrid(selfiePhotos)}</TabsContent>
            <TabsContent value="photos">{renderPhotoGrid(profilePhotos)}</TabsContent>
            <TabsContent value="all">{renderPhotoGrid(photos)}</TabsContent>
          </>
        )}
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approved' ? 'Approve Photo' : 'Reject Photo'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approved'
                ? 'This photo will be approved and visible on the user\'s profile.'
                : 'This photo will be rejected. The user will be notified.'}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.photo && (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <img src={actionDialog.photo.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-medium">{actionDialog.photo.user?.firstName} {actionDialog.photo.user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{actionDialog.photo.user?.email}</p>
                <div className="mt-1 flex gap-1">
                  {actionDialog.photo.isSelfieVerification && <Badge variant="info" className="text-[10px]">Selfie</Badge>}
                  {actionDialog.photo.isMain && <Badge className="text-[10px]">Main Photo</Badge>}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Moderator Note (optional)</label>
            <Textarea
              placeholder="Add a note about this decision..."
              value={actionDialog.note}
              onChange={(e) => setActionDialog({ ...actionDialog, note: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, photo: null, action: '', note: '' })}>
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              disabled={actionLoading}
              className={actionDialog.action === 'approved' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              variant={actionDialog.action === 'rejected' ? 'destructive' : 'default'}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {actionDialog.action === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
