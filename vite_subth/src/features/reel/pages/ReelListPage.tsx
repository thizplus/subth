import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Film,
  MoreHorizontal,
  RefreshCw,
  Play,
  CheckCircle,
  XCircle,
  ChevronsUpDown,
  Check,
  Image,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import {
  useReelList,
  useDeleteReel,
  useSyncReel,
  type Reel,
  type ReelListParams,
} from '@/features/reel'
import { useVideoList, type Video } from '@/features/video'

// MetricItem Component
interface MetricItemProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  isLoading?: boolean
}

function MetricItem({ label, value, icon, isLoading }: MetricItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      )}
    </div>
  )
}

export function ReelListPage() {
  const { page: pageParam } = useParams()
  const navigate = useNavigate()
  const page = pageParam ? parseInt(pageParam, 10) : 1

  const [filters] = useState<ReelListParams>({})

  // Dialogs
  const [isSyncOpen, setIsSyncOpen] = useState(false)
  const [syncSuekkId, setSyncSuekkId] = useState('')
  const [syncTitle, setSyncTitle] = useState('')
  const [syncDescription, setSyncDescription] = useState('')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [videoSearchOpen, setVideoSearchOpen] = useState(false)
  const [videoSearchQuery, setVideoSearchQuery] = useState('')
  const [deletingReel, setDeletingReel] = useState<Reel | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [previewCover, setPreviewCover] = useState<string | null>(null)

  // Queries & Mutations
  const { data, isLoading } = useReelList({
    page,
    limit: 20,
    ...filters,
  })
  const deleteReel = useDeleteReel()
  const syncReel = useSyncReel()

  // Video search for sync dialog
  const { data: videoData, isLoading: isLoadingVideos } = useVideoList({
    search: videoSearchQuery,
    limit: 20,
  })

  // Filter videos based on search query
  const filteredVideos = useMemo(() => {
    if (!videoData?.data) return []
    if (!videoSearchQuery) return videoData.data.slice(0, 10)
    return videoData.data
  }, [videoData?.data, videoSearchQuery])

  // Navigate to page
  const goToPage = (p: number) => {
    if (p === 1) {
      navigate('/reels')
    } else {
      navigate(`/reels/page/${p}`)
    }
  }

  const handleSync = async () => {
    if (!syncSuekkId.trim()) {
      toast.error('กรุณากรอก Suekk Reel ID')
      return
    }

    try {
      await syncReel.mutateAsync({
        suekkReelId: syncSuekkId.trim(),
        videoId: selectedVideo?.id || undefined,
        title: syncTitle.trim() || undefined,
        description: syncDescription.trim() || undefined,
      })
      toast.success('Sync Reel สำเร็จ')
      setIsSyncOpen(false)
      setSyncSuekkId('')
      setSyncTitle('')
      setSyncDescription('')
      setSelectedVideo(null)
      setVideoSearchQuery('')
    } catch (error: any) {
      toast.error(error?.message || 'Sync ไม่สำเร็จ')
    }
  }

  const handleDelete = async () => {
    if (!deletingReel) return
    try {
      await deleteReel.mutateAsync(deletingReel.id)
      toast.success('ลบ Reel สำเร็จ')
      setDeletingReel(null)
    } catch {
      toast.error('ลบไม่สำเร็จ')
    }
  }

  const totalPages = data?.meta.totalPages || 1
  const total = data?.meta.total || 0

  // Count active/inactive
  const activeCount = data?.data.filter((r) => r.isActive).length || 0

  // Pagination logic
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 'ellipsis', totalPages)
      } else if (page >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, 'ellipsis', page, 'ellipsis', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reels</h1>
          <p className="text-muted-foreground">จัดการ Reels ทั้งหมด</p>
        </div>
        <Button onClick={() => setIsSyncOpen(true)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync จาก Suekk
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="Reels ทั้งหมด"
          value={`${total.toLocaleString()} รายการ`}
          icon={<Film className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="หน้าปัจจุบัน"
          value={`${page} / ${totalPages}`}
          isLoading={isLoading}
        />
        <MetricItem
          label="Active (หน้านี้)"
          value={`${activeCount} รายการ`}
          icon={<CheckCircle className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="แสดงผล"
          value={`${data?.data.length || 0} รายการ`}
          isLoading={isLoading}
        />
      </div>

      <Separator />

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[72px]">Thumb</TableHead>
              <TableHead className="w-auto">Title</TableHead>
              <TableHead className="hidden md:table-cell w-[100px]">สถานะ</TableHead>
              <TableHead className="hidden lg:table-cell w-[140px]">สร้างเมื่อ</TableHead>
              <TableHead className="w-[60px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="w-16 aspect-video rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Film className="h-10 w-10" />
                    <div>
                      <p className="font-medium">ไม่มี Reels</p>
                      <p className="text-sm">Sync Reel จาก Suekk เพื่อเริ่มต้น</p>
                    </div>
                    <Button size="sm" onClick={() => setIsSyncOpen(true)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync จาก Suekk
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((item) => (
                <TableRow key={item.id} className="group">
                  {/* Thumbnail 16:9 */}
                  <TableCell className="p-2">
                    <div
                      className="w-16 aspect-video bg-muted overflow-hidden flex-shrink-0 cursor-pointer relative rounded"
                      onClick={() => item.videoUrl && setPreviewVideo(item.videoUrl)}
                    >
                      {item.thumbUrl ? (
                        <>
                          <img
                            src={item.thumbUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Film className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {/* Title */}
                  <TableCell className="p-2 overflow-hidden">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.title || 'ไม่มีชื่อ'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {item.id.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-2">
                    {item.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell p-2">
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewVideo(item.videoUrl)}>
                          <Play className="mr-2 h-4 w-4" />
                          ดูวิดีโอ
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => item.coverUrl && setPreviewCover(item.coverUrl)}
                          disabled={!item.coverUrl}
                        >
                          <Image className="mr-2 h-4 w-4" />
                          ดู Cover
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingReel(item)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          ลบ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && goToPage(page - 1)}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {getPageNumbers().map((p, idx) =>
              p === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => goToPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && goToPage(page + 1)}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Sync Dialog */}
      <Dialog open={isSyncOpen} onOpenChange={setIsSyncOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sync Reel จาก Suekk</DialogTitle>
            <DialogDescription>
              ดาวน์โหลด Reel จาก Suekk และอัพโหลดไป R2
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Suekk Reel ID (UUID) *</Label>
              <Input
                value={syncSuekkId}
                onChange={(e) => setSyncSuekkId(e.target.value)}
                placeholder="1cb78480-2d53-4363-b6c0-aaa224a0ccdd"
              />
              <p className="text-xs text-muted-foreground">
                UUID ของ reel จาก suekk (ไม่ใช่ video code)
              </p>
            </div>

            {/* Video Selector */}
            <div className="space-y-2">
              <Label>เลือกวิดีโอ (optional)</Label>
              <Popover open={videoSearchOpen} onOpenChange={setVideoSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={videoSearchOpen}
                    className="w-full justify-between font-normal overflow-hidden"
                  >
                    {selectedVideo ? (
                      <span className="truncate max-w-[340px]">{selectedVideo.title}</span>
                    ) : (
                      <span className="text-muted-foreground">ค้นหาวิดีโอ...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="พิมพ์ชื่อวิดีโอ..."
                      value={videoSearchQuery}
                      onValueChange={setVideoSearchQuery}
                    />
                    <CommandList>
                      {isLoadingVideos ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : filteredVideos.length === 0 ? (
                        <CommandEmpty>ไม่พบวิดีโอ</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {filteredVideos.map((video) => (
                            <CommandItem
                              key={video.id}
                              value={video.id}
                              onSelect={() => {
                                setSelectedVideo(video.id === selectedVideo?.id ? null : video)
                                setVideoSearchOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 flex-shrink-0',
                                  selectedVideo?.id === video.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span className="truncate">{video.title}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedVideo && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate max-w-[300px]">{selectedVideo.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{selectedVideo.id.slice(0, 8)}...</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => setSelectedVideo(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={syncTitle}
                onChange={(e) => setSyncTitle(e.target.value)}
                placeholder="ชื่อ Reel"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={syncDescription}
                onChange={(e) => setSyncDescription(e.target.value)}
                placeholder="คำอธิบาย Reel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSyncOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSync} disabled={syncReel.isPending}>
              {syncReel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลัง Sync...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingReel} onOpenChange={(open) => !open && setDeletingReel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ Reel นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReel.isPending ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Preview Dialog */}
      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Preview Video</DialogTitle>
          {previewVideo && (
            <video
              src={previewVideo}
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh]"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Cover Preview Dialog */}
      <Dialog open={!!previewCover} onOpenChange={(open) => !open && setPreviewCover(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">Preview Cover</DialogTitle>
          {previewCover && (
            <img
              src={previewCover}
              alt="Cover"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
