import { useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Search, X, Loader2, Activity, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useAllActivity, type ActivityLogParams } from '@/features/user'

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

const PAGE_TYPES = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'video', label: 'ดูวิดีโอ' },
  { value: 'cast', label: 'ดูนักแสดง' },
  { value: 'tag', label: 'ดูแท็ก' },
  { value: 'maker', label: 'ดูค่าย' },
  { value: 'category', label: 'ดูหมวดหมู่' },
  { value: 'search', label: 'ค้นหา' },
  { value: 'ai-search', label: 'ค้นหา AI' },
  { value: 'reel', label: 'ดู Reel' },
  { value: 'feed', label: 'ดู Feed' },
  { value: 'profile', label: 'ดูโปรไฟล์' },
]

const PAGE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  PAGE_TYPES.filter(p => p.value).map(p => [p.value, p.label])
)

export function ActivityLogPage() {
  const { page: pageParam } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const page = pageParam ? parseInt(pageParam, 10) : 1
  const userIdFilter = searchParams.get('userId') || ''

  const [filters, setFilters] = useState<ActivityLogParams>({
    pageType: '',
  })

  // Query
  const { data, isLoading } = useAllActivity({
    page,
    limit: 30,
    ...filters,
  })

  // Navigate to page
  const goToPage = (p: number) => {
    const params = userIdFilter ? `?userId=${userIdFilter}` : ''
    if (p === 1) {
      navigate(`/activity${params}`)
    } else {
      navigate(`/activity/page/${p}${params}`)
    }
  }

  const clearFilters = () => {
    setFilters({ pageType: '' })
    goToPage(1)
  }

  const hasFilters = filters.pageType

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
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">ประวัติการใช้งานทั้งหมดในระบบ</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="Activity ทั้งหมด"
          value={`${total.toLocaleString()} รายการ`}
          icon={<Activity className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="หน้าปัจจุบัน"
          value={`${page} / ${totalPages}`}
          icon={<Eye className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="แสดงผล"
          value={`${data?.data.length || 0} รายการ`}
          isLoading={isLoading}
        />
        <MetricItem
          label="Filter"
          value={hasFilters ? PAGE_TYPE_LABELS[filters.pageType || ''] || 'กรองอยู่' : 'ไม่มี'}
          isLoading={false}
        />
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.pageType || 'all'}
            onValueChange={(v) => {
              setFilters({ ...filters, pageType: v === 'all' ? '' : v })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ประเภท Activity" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_TYPES.map((type) => (
                <SelectItem key={type.value || 'all'} value={type.value || 'all'}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="w-[180px]">ผู้ใช้</TableHead>
              <TableHead className="w-[100px]">ประเภท</TableHead>
              <TableHead className="w-auto">Path</TableHead>
              <TableHead className="hidden md:table-cell w-[120px]">IP</TableHead>
              <TableHead className="w-[160px]">เวลา</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Activity className="h-10 w-10" />
                    <div>
                      <p className="font-medium">ไม่พบ Activity</p>
                      <p className="text-sm">ยังไม่มีประวัติการใช้งาน</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={log.avatar} alt={log.username} />
                      <AvatarFallback className="text-xs">
                        {log.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="p-2">
                    <Link
                      to={`/users/${log.userId}`}
                      className="hover:underline"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {log.displayName || log.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{log.username}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="p-2">
                    <Badge variant="secondary" className="text-xs">
                      {PAGE_TYPE_LABELS[log.pageType] || log.pageType}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2">
                    <span className="text-sm font-mono text-muted-foreground truncate block">
                      {log.path}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.ipAddress}
                    </span>
                  </TableCell>
                  <TableCell className="p-2">
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('th-TH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
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
    </div>
  )
}
