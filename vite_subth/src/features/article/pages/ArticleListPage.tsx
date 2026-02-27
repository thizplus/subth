import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  Loader2,
  FileText,
  Calendar,
  Clock,
  MoreHorizontal,
  Trash2,
  Eye,
  Archive,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  useArticleList,
  useArticleById,
  useArticleStats,
  useUpdateArticleStatus,
  useDeleteArticle,
  useClearArticleCache,
  type ArticleListItem,
  type ArticleListParams,
  type ArticleStatus,
  type IndexingStatus,
} from '@/features/article'
import { getCdnUrl } from '@/constants'

// Status badge styles
const STATUS_STYLES: Record<ArticleStatus, string> = {
  draft: 'status-pending',
  scheduled: 'status-info',
  published: 'status-success',
  archived: 'status-muted',
}

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: 'ฉบับร่าง',
  scheduled: 'รอเผยแพร่',
  published: 'เผยแพร่แล้ว',
  archived: 'เก็บถาวร',
}

const INDEXING_STYLES: Record<IndexingStatus, string> = {
  pending: 'status-pending',
  indexed: 'status-success',
  failed: 'status-danger',
}

const INDEXING_LABELS: Record<IndexingStatus, string> = {
  pending: 'รอ Index',
  indexed: 'Indexed',
  failed: 'Index ล้มเหลว',
}

// Metric Item Component
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

export function ArticleListPage() {
  const { page: pageParam } = useParams()
  const navigate = useNavigate()
  const page = pageParam ? parseInt(pageParam, 10) : 1

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<ArticleListParams>({})

  // Dialogs
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deletingArticle, setDeletingArticle] = useState<ArticleListItem | null>(null)

  // Queries & Mutations
  const { data, isLoading } = useArticleList({
    page,
    limit: 20,
    search: search || undefined,
    ...filters,
  })
  const { data: stats, isLoading: statsLoading } = useArticleStats()
  const { data: viewingArticle } = useArticleById(viewingId || '')
  const updateStatus = useUpdateArticleStatus()
  const deleteArticle = useDeleteArticle()
  const clearCache = useClearArticleCache()

  // Navigate to page
  const goToPage = (p: number) => {
    if (p === 1) {
      navigate('/articles')
    } else {
      navigate(`/articles/page/${p}`)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
    goToPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearch('')
    setSearchInput('')
    goToPage(1)
  }

  const handleStatusChange = async (article: ArticleListItem, newStatus: ArticleStatus) => {
    try {
      await updateStatus.mutateAsync({
        id: article.id,
        payload: { status: newStatus },
      })
      toast.success(`อัพเดทสถานะเป็น "${STATUS_LABELS[newStatus]}" สำเร็จ`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
      toast.error(`อัพเดทสถานะล้มเหลว: ${message}`)
      console.error('Update status error:', error)
    }
  }

  const handleDelete = async () => {
    if (!deletingArticle) return
    try {
      await deleteArticle.mutateAsync(deletingArticle.id)
      toast.success('ลบบทความสำเร็จ')
      setDeletingArticle(null)
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleClearCache = async (article: ArticleListItem) => {
    try {
      await clearCache.mutateAsync({ type: article.type, slug: article.slug })
      toast.success('ล้าง cache สำเร็จ')
    } catch {
      toast.error('ล้าง cache ล้มเหลว')
    }
  }

  const hasFilters = Object.values(filters).some((v) => v) || search

  const totalPages = data?.meta.totalPages || 1
  const total = data?.meta.total || 0

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
          <h1 className="text-2xl font-bold tracking-tight">บทความ</h1>
          <p className="text-muted-foreground">จัดการบทความ SEO ที่สร้างจาก AI</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="บทความทั้งหมด"
          value={stats?.totalArticles ?? 0}
          icon={<FileText className="h-3 w-3" />}
          isLoading={statsLoading}
        />
        <MetricItem
          label="เผยแพร่แล้ว"
          value={stats?.publishedCount ?? 0}
          icon={<CheckCircle2 className="h-3 w-3" />}
          isLoading={statsLoading}
        />
        <MetricItem
          label="รอ Index"
          value={stats?.pendingIndex ?? 0}
          icon={<AlertCircle className="h-3 w-3" />}
          isLoading={statsLoading}
        />
        <MetricItem
          label="Index แล้ว"
          value={stats?.indexedCount ?? 0}
          icon={<CheckCircle2 className="h-3 w-3" />}
          isLoading={statsLoading}
        />
      </div>

      <Separator />

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อบทความ..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status || 'all'}
            onValueChange={(v) => {
              setFilters({ ...filters, status: v === 'all' ? undefined : (v as ArticleStatus) })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="draft">ฉบับร่าง</SelectItem>
              <SelectItem value="scheduled">รอเผยแพร่</SelectItem>
              <SelectItem value="published">เผยแพร่แล้ว</SelectItem>
              <SelectItem value="archived">เก็บถาวร</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.indexing_status || 'all'}
            onValueChange={(v) => {
              setFilters({ ...filters, indexing_status: v === 'all' ? undefined : (v as IndexingStatus) })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Index" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอ Index</SelectItem>
              <SelectItem value="indexed">Indexed</SelectItem>
              <SelectItem value="failed">ล้มเหลว</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sort_by || 'default'}
            onValueChange={(v) => {
              setFilters({ ...filters, sort_by: v === 'default' ? undefined : (v as ArticleListParams['sort_by']) })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="เรียงตาม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">ค่าเริ่มต้น</SelectItem>
              <SelectItem value="created_at">วันที่สร้าง</SelectItem>
              <SelectItem value="published_at">วันที่เผยแพร่</SelectItem>
              <SelectItem value="quality_score">คะแนนคุณภาพ</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden bg-card">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[80px]">Thumbnail</TableHead>
              <TableHead className="w-auto">ชื่อบทความ</TableHead>
              <TableHead className="hidden md:table-cell w-[100px]">สถานะ</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">Index</TableHead>
              <TableHead className="hidden lg:table-cell w-[80px] text-center">คะแนน</TableHead>
              <TableHead className="hidden xl:table-cell w-[80px] text-center">อ่าน</TableHead>
              <TableHead className="hidden xl:table-cell w-[100px]">วันที่</TableHead>
              <TableHead className="w-[70px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-16 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <FileText className="h-10 w-10" />
                    <div>
                      <p className="font-medium">ไม่พบบทความ</p>
                      <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="p-2">
                    <div className="w-16 h-12 bg-muted overflow-hidden flex-shrink-0 rounded">
                      {item.videoThumbnail ? (
                        <img
                          src={getCdnUrl(item.videoThumbnail)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 overflow-hidden">
                    <div className="space-y-0.5 min-w-0">
                      <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {item.videoCode}
                      </code>
                      <p className="font-medium text-sm truncate" title={item.title}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        /{item.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-2">
                    <Badge className={STATUS_STYLES[item.status]}>
                      {STATUS_LABELS[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell p-2">
                    <Badge variant="outline" className={INDEXING_STYLES[item.indexingStatus]}>
                      {INDEXING_LABELS[item.indexingStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center p-2">
                    <span className="text-sm font-medium tabular-nums">
                      {item.qualityScore}
                    </span>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-center p-2">
                    <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.readingTime} นาที
                    </span>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell p-2">
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
                        <DropdownMenuItem onClick={() => setViewingId(item.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          ดูรายละเอียด
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {item.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(item, 'published')}>
                            <Send className="mr-2 h-4 w-4" />
                            เผยแพร่
                          </DropdownMenuItem>
                        )}
                        {item.status === 'published' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(item, 'archived')}>
                            <Archive className="mr-2 h-4 w-4" />
                            เก็บถาวร
                          </DropdownMenuItem>
                        )}
                        {item.status === 'archived' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(item, 'draft')}>
                            <FileText className="mr-2 h-4 w-4" />
                            กลับเป็นฉบับร่าง
                          </DropdownMenuItem>
                        )}
                        {item.status === 'published' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleClearCache(item)}
                              disabled={clearCache.isPending}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              ล้าง Cache
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingArticle(item)}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingArticle} onOpenChange={(open) => !open && setDeletingArticle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบบทความ "{deletingArticle?.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteArticle.isPending ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Article Detail Dialog */}
      <Dialog open={!!viewingId} onOpenChange={(open) => !open && setViewingId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดบทความ</DialogTitle>
            <DialogDescription>
              {viewingArticle?.videoCode} - {viewingArticle?.title}
            </DialogDescription>
          </DialogHeader>
          {viewingArticle && (
            <div className="space-y-4">
              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Meta Title</p>
                  <p className="font-medium">{viewingArticle.metaTitle}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Slug</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">/{viewingArticle.slug}</code>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Meta Description</p>
                <p className="text-sm">{viewingArticle.metaDescription}</p>
              </div>

              <Separator />

              {/* Summary */}
              {viewingArticle.content?.summary && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">สรุป</p>
                  <p className="text-sm">{viewingArticle.content.summary}</p>
                </div>
              )}

              {/* Highlights */}
              {viewingArticle.content?.highlights && viewingArticle.content.highlights.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">ไฮไลท์</p>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {viewingArticle.content.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gallery Preview */}
              {viewingArticle.content?.galleryImages && viewingArticle.content.galleryImages.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">แกลเลอรี่ ({viewingArticle.content.galleryImages.length} รูป)</p>
                  <div className="grid grid-cols-4 gap-2">
                    {viewingArticle.content.galleryImages.slice(0, 8).map((img, i) => (
                      <div key={i} className="aspect-video bg-muted rounded overflow-hidden">
                        <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_STYLES[viewingArticle.status]}>
                    {STATUS_LABELS[viewingArticle.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={INDEXING_STYLES[viewingArticle.indexingStatus]}>
                    {INDEXING_LABELS[viewingArticle.indexingStatus]}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  คะแนน: {viewingArticle.qualityScore}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {viewingArticle.readingTime} นาที
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
