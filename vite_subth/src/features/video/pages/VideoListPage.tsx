import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Video, X, Loader2, Film, Calendar, Users, Tag, MoreHorizontal, ImagePlus } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MultiSelectAutocomplete, type SelectOption } from '@/components/ui/multi-select-autocomplete'
import { DatePickerString } from '@/components/ui/date-picker'
import { ImageInput } from '@/components/ui/image-input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  useVideoList,
  useVideoById,
  useCreateVideo,
  useUpdateVideo,
  useDeleteVideo,
  useRegenerateGallery,
  type Video as VideoType,
  type VideoListParams,
} from '@/features/video'
import { getCdnUrl } from '@/constants'
import { useMakerSearch } from '@/features/maker'
import { useCastSearch } from '@/features/cast'
import { useTagSearch } from '@/features/tag'
import { useCategoryList } from '@/features/category'

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

export function VideoListPage() {
  const { page: pageParam } = useParams()
  const navigate = useNavigate()
  const page = pageParam ? parseInt(pageParam, 10) : 1

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<VideoListParams>({})

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingVideo, setDeletingVideo] = useState<VideoType | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Form state
  const [formCode, setFormCode] = useState('')
  const [formTitleEn, setFormTitleEn] = useState('')
  const [formTitleTh, setFormTitleTh] = useState('')
  const [formTitleJa, setFormTitleJa] = useState('')
  const [formThumbnail, setFormThumbnail] = useState('')
  const [formEmbedUrl, setFormEmbedUrl] = useState('')
  const [formCategories, setFormCategories] = useState<string[]>([])
  const [formReleaseDate, setFormReleaseDate] = useState('')
  const [formMaker, setFormMaker] = useState('')
  const [formCasts, setFormCasts] = useState<SelectOption[]>([])
  const [formTags, setFormTags] = useState<SelectOption[]>([])

  // Search states for autocomplete
  const [makerSearch, setMakerSearch] = useState('')
  const [castSearch, setCastSearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')

  // Queries & Mutations
  const { data, isLoading } = useVideoList({
    page,
    limit: 20,
    search: search || undefined,
    ...filters,
  })
  const { data: editingVideo } = useVideoById(editingId || '', 'en')
  const createVideo = useCreateVideo()
  const updateVideo = useUpdateVideo()
  const deleteVideo = useDeleteVideo()
  const regenerateGallery = useRegenerateGallery()

  // Search queries for autocomplete
  const { data: makerResults } = useMakerSearch(makerSearch)
  const { data: castResults, isFetching: isCastFetching } = useCastSearch(castSearch)
  const { data: tagResults, isFetching: isTagFetching } = useTagSearch(tagSearch)
  const { data: categories } = useCategoryList()

  // Navigate to page
  const goToPage = (p: number) => {
    if (p === 1) {
      navigate('/videos')
    } else {
      navigate(`/videos/page/${p}`)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
    goToPage(1)
  }

  const resetForm = () => {
    setFormCode('')
    setFormTitleEn('')
    setFormTitleTh('')
    setFormTitleJa('')
    setFormThumbnail('')
    setFormEmbedUrl('')
    setFormCategories([])
    setFormReleaseDate('')
    setFormMaker('')
    setFormCasts([])
    setFormTags([])
  }

  const clearFilters = () => {
    setFilters({})
    setSearch('')
    setSearchInput('')
    goToPage(1)
  }

  const handleCreate = async () => {
    if (!formTitleEn.trim()) {
      toast.error('กรุณากรอกชื่อ (English)')
      return
    }

    const titles: Record<string, string> = { en: formTitleEn.trim() }
    if (formTitleTh.trim()) titles.th = formTitleTh.trim()
    if (formTitleJa.trim()) titles.ja = formTitleJa.trim()

    try {
      await createVideo.mutateAsync({
        titles,
        thumbnail: formThumbnail.trim() || undefined,
        embed_url: formEmbedUrl.trim() || undefined,
        categories: formCategories.length > 0 ? formCategories : undefined,
        release_date: formReleaseDate || undefined,
        maker: formMaker.trim() || undefined,
        cast: formCasts.length > 0 ? formCasts.map((c) => c.name) : undefined,
        tags: formTags.length > 0 ? formTags.map((t) => t.name) : undefined,
      })
      toast.success('สร้าง Video สำเร็จ')
      setIsCreateOpen(false)
      resetForm()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleUpdate = async () => {
    if (!editingId || !formTitleEn.trim()) return

    const titles: Record<string, string> = { en: formTitleEn.trim() }
    if (formTitleTh.trim()) titles.th = formTitleTh.trim()
    if (formTitleJa.trim()) titles.ja = formTitleJa.trim()

    try {
      await updateVideo.mutateAsync({
        id: editingId,
        payload: {
          code: formCode.trim() || undefined,
          titles,
          thumbnail: formThumbnail.trim() || undefined,
          embed_url: formEmbedUrl.trim() || undefined,
          categories: formCategories.length > 0 ? formCategories : undefined,
          release_date: formReleaseDate || undefined,
          maker: formMaker.trim() || undefined,
          cast: formCasts.length > 0 ? formCasts.map((c) => c.name) : undefined,
          tags: formTags.length > 0 ? formTags.map((t) => t.name) : undefined,
        },
      })
      toast.success('อัพเดท Video สำเร็จ')
      setEditingId(null)
      resetForm()
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const handleDelete = async () => {
    if (!deletingVideo) return
    try {
      await deleteVideo.mutateAsync(deletingVideo.id)
      toast.success('ลบ Video สำเร็จ')
      setDeletingVideo(null)
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  const openEdit = (video: VideoType) => {
    setEditingId(video.id)
  }

  // Load editing data when editingVideo changes
  if (editingVideo && editingId && formTitleEn === '') {
    setFormCode(editingVideo.code || '')
    setFormTitleEn(editingVideo.translations?.en || editingVideo.title || '')
    setFormTitleTh(editingVideo.translations?.th || '')
    setFormTitleJa(editingVideo.translations?.ja || '')
    setFormThumbnail(editingVideo.thumbnail || '')
    setFormEmbedUrl(editingVideo.embedUrl || '')
    setFormCategories(editingVideo.categories?.map(c => typeof c === 'string' ? c : c.slug) || [])
    setFormReleaseDate(editingVideo.releaseDate?.split('T')[0] || '')
    setFormMaker(typeof editingVideo.maker === 'object' ? editingVideo.maker?.name || '' : editingVideo.maker || '')
    setFormCasts(editingVideo.casts?.map((c) => ({ id: c.id || c.name, name: c.name })) || [])
    setFormTags(editingVideo.tags?.map((t) => ({ id: t.id || t.name, name: t.name })) || [])
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

  // Form Dialog Content
  const formContent = (
    <div className="no-scrollbar -mx-6 max-h-[60vh] overflow-y-auto px-6 space-y-5">
      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Thumbnail</Label>
        <ImageInput
          value={formThumbnail ? getCdnUrl(formThumbnail) : ''}
          onChange={(v) => setFormThumbnail(v)}
          placeholder="เลือกรูป Thumbnail"
          aspectRatio="video"
          previewClassName="rounded-none"
        />
      </div>

      {/* Title Tabs */}
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="en">English *</TabsTrigger>
          <TabsTrigger value="th">ไทย</TabsTrigger>
          <TabsTrigger value="ja">日本語</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="mt-3">
          <Input
            value={formTitleEn}
            onChange={(e) => setFormTitleEn(e.target.value)}
            placeholder="Title in English (required)"
          />
        </TabsContent>
        <TabsContent value="th" className="mt-3">
          <Input
            value={formTitleTh}
            onChange={(e) => setFormTitleTh(e.target.value)}
            placeholder="ชื่อภาษาไทย"
          />
        </TabsContent>
        <TabsContent value="ja" className="mt-3">
          <Input
            value={formTitleJa}
            onChange={(e) => setFormTitleJa(e.target.value)}
            placeholder="日本語タイトル"
          />
        </TabsContent>
      </Tabs>

      {/* Categories & Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>หมวดหมู่ (เลือกได้หลายรายการ)</Label>
          <MultiSelectAutocomplete
            selected={formCategories.map(slug => {
              const cat = categories?.find(c => c.slug === slug || c.name === slug)
              return { id: cat?.id || slug, name: cat?.name || slug }
            })}
            onChange={(opts) => setFormCategories(opts.map(o => {
              const cat = categories?.find(c => c.name === o.name)
              return cat?.slug || o.name
            }))}
            options={categories?.map((c) => ({ id: c.id, name: c.name })) || []}
            onSearch={() => {}}
            placeholder="เลือกหมวดหมู่..."
            minSearchLength={0}
          />
        </div>
        <div className="space-y-2">
          <Label>วันที่เผยแพร่</Label>
          <DatePickerString
            value={formReleaseDate}
            onChange={(v) => setFormReleaseDate(v)}
            placeholder="เลือกวันที่"
          />
        </div>
      </div>

      {/* Code & Embed URL */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Code (suekk)</Label>
          <Input
            value={formCode}
            onChange={(e) => setFormCode(e.target.value)}
            placeholder="เช่น dbprhr2b"
          />
          <p className="text-xs text-muted-foreground">
            ถ้าไม่ใส่จะ extract จาก Embed URL อัตโนมัติ
          </p>
        </div>
        <div className="space-y-2">
          <Label>Embed URL</Label>
          <Input
            value={formEmbedUrl}
            onChange={(e) => setFormEmbedUrl(e.target.value)}
            placeholder="https://player.suekk.com/embed/..."
          />
        </div>
      </div>

      {/* Maker */}
      <div className="space-y-2">
        <Label>Maker</Label>
        <div className="relative">
          <Input
            value={formMaker}
            onChange={(e) => {
              setFormMaker(e.target.value)
              setMakerSearch(e.target.value)
            }}
            placeholder="ชื่อ Maker"
          />
          {makerSearch && makerResults && makerResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full border rounded-md max-h-32 overflow-y-auto bg-popover shadow-lg">
              {makerResults.slice(0, 5).map((maker) => (
                <button
                  key={maker.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-accent text-sm transition-colors"
                  onClick={() => {
                    setFormMaker(maker.name)
                    setMakerSearch('')
                  }}
                >
                  {maker.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Casts */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Casts
        </Label>
        <MultiSelectAutocomplete
          selected={formCasts}
          onChange={setFormCasts}
          options={castResults?.map((c) => ({ id: c.id, name: c.name })) || []}
          onSearch={setCastSearch}
          placeholder="ค้นหา Cast..."
          allowCreate
          createLabel="เพิ่ม Cast"
          isLoading={isCastFetching}
          minSearchLength={2}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </Label>
        <MultiSelectAutocomplete
          selected={formTags}
          onChange={setFormTags}
          options={tagResults?.map((t) => ({ id: t.id, name: t.name })) || []}
          onSearch={setTagSearch}
          placeholder="ค้นหา Tag..."
          allowCreate
          createLabel="เพิ่ม Tag"
          isLoading={isTagFetching}
          minSearchLength={2}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Videos</h1>
          <p className="text-muted-foreground">จัดการข้อมูลวิดีโอทั้งหมด</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่ม Video
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="วิดีโอทั้งหมด"
          value={`${total.toLocaleString()} รายการ`}
          icon={<Film className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="หน้าปัจจุบัน"
          value={`${page} / ${totalPages}`}
          icon={<Video className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="แสดงผล"
          value={`${data?.data.length || 0} รายการ`}
          icon={<Calendar className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="หมวดหมู่"
          value={`${categories?.length || 0} หมวด`}
          isLoading={!categories}
        />
      </div>

      <Separator />

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อวิดีโอ..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.category || 'all'}
            onValueChange={(v) => {
              setFilters({ ...filters, category: v === 'all' ? undefined : v })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="หมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sort_by || 'default'}
            onValueChange={(v) => {
              setFilters({ ...filters, sort_by: v === 'default' ? undefined : (v as VideoListParams['sort_by']) })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="เรียงตาม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">ค่าเริ่มต้น</SelectItem>
              <SelectItem value="date">วันที่เผยแพร่</SelectItem>
              <SelectItem value="created_at">วันที่สร้าง</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.order || 'default'}
            onValueChange={(v) => {
              setFilters({ ...filters, order: v === 'default' ? undefined : (v as VideoListParams['order']) })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="ลำดับ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">ค่าเริ่มต้น</SelectItem>
              <SelectItem value="desc">ใหม่สุด</SelectItem>
              <SelectItem value="asc">เก่าสุด</SelectItem>
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
              <TableHead className="w-[100px]">Thumbnail</TableHead>
              <TableHead className="w-auto">ชื่อวิดีโอ</TableHead>
              <TableHead className="hidden md:table-cell w-[120px]">Maker</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">หมวดหมู่</TableHead>
              <TableHead className="hidden lg:table-cell w-[60px] text-center">Cast</TableHead>
              <TableHead className="hidden xl:table-cell w-[100px]">วันที่</TableHead>
              <TableHead className="w-[80px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-14 w-24 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full max-w-[200px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Video className="h-10 w-10" />
                    <div>
                      <p className="font-medium">ไม่พบข้อมูลวิดีโอ</p>
                      <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือเพิ่มวิดีโอใหม่</p>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      เพิ่มวิดีโอใหม่
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="p-2">
                    <div
                      className="w-24 h-14 bg-muted overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => item.thumbnail && setPreviewImage(getCdnUrl(item.thumbnail))}
                    >
                      {item.thumbnail ? (
                        <img
                          src={getCdnUrl(item.thumbnail)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Video className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 overflow-hidden">
                    <div className="space-y-0.5 min-w-0">
                      {item.code && (
                        <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {item.code}
                        </code>
                      )}
                      <p className="font-medium text-sm truncate" title={item.title}>
                        {item.title}
                      </p>
                      {item.titleTh && (
                        <p className="text-xs text-muted-foreground truncate" title={item.titleTh}>
                          {item.titleTh}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground md:hidden truncate">
                        {item.maker || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-2">
                    <span className="text-sm text-muted-foreground truncate block">
                      {item.maker || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell p-2">
                    {item.categories && item.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat} variant="secondary" className="font-normal text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {item.categories.length > 2 && (
                          <Badge variant="outline" className="font-normal text-xs">
                            +{item.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center p-2">
                    {item.casts && item.casts.length > 0 ? (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="cursor-help text-xs">
                            {item.casts.length}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-[200px]">
                            {item.casts.map(c => c.name).join(', ')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell p-2">
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {item.releaseDate
                        ? new Date(item.releaseDate).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
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
                        <DropdownMenuItem onClick={() => openEdit(item)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          แก้ไข
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              await regenerateGallery.mutateAsync(item.id)
                              toast.success('กำลังสร้าง Gallery ใหม่')
                            } catch {
                              toast.error('ไม่สามารถสร้าง Gallery ได้')
                            }
                          }}
                          disabled={regenerateGallery.isPending}
                        >
                          <ImagePlus className="mr-2 h-4 w-4" />
                          สร้าง Gallery ใหม่
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingVideo(item)}
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

      {/* Create Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>เพิ่ม Video</DialogTitle>
            <DialogDescription>กรอกข้อมูลเพื่อสร้างวิดีโอใหม่</DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleCreate} disabled={createVideo.isPending}>
              {createVideo.isPending ? 'กำลังสร้าง...' : 'สร้าง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingId}
        onOpenChange={(open) => {
          if (!open) {
            setEditingId(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไข Video</DialogTitle>
            <DialogDescription>แก้ไขข้อมูลวิดีโอ</DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate} disabled={updateVideo.isPending}>
              {updateVideo.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingVideo} onOpenChange={(open) => !open && setDeletingVideo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ "{deletingVideo?.title}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVideo.isPending ? 'กำลังลบ...' : 'ลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Preview Thumbnail</DialogTitle>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
