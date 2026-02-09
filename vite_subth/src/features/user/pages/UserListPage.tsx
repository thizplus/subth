import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Search, X, Loader2, Users, UserCheck, UserX, Shield, MoreHorizontal, Eye } from 'lucide-react'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useUserList, type UserListItem, type UserListParams } from '@/features/user'
import { ROLE, ROLE_LABELS, ROLE_STYLES, type RoleType } from '@/constants/enums'

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

export function UserListPage() {
  const { page: pageParam } = useParams()
  const navigate = useNavigate()
  const page = pageParam ? parseInt(pageParam, 10) : 1

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<UserListParams>({})

  // Query
  const { data, isLoading } = useUserList({
    page,
    limit: 20,
    search: search || undefined,
    ...filters,
  })

  // Navigate to page
  const goToPage = (p: number) => {
    if (p === 1) {
      navigate('/users')
    } else {
      navigate(`/users/page/${p}`)
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

  const hasFilters = Object.values(filters).some((v) => v) || search

  const totalPages = data?.meta.totalPages || 1
  const total = data?.meta.total || 0

  // Count active/inactive users from current page
  const activeCount = data?.data.filter((u) => u.isActive).length || 0
  const inactiveCount = data?.data.filter((u) => !u.isActive).length || 0

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

  const getInitials = (user: UserListItem) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.username[0].toUpperCase()
  }

  const getAvatarUrl = (user: UserListItem) => {
    if (user.avatar) return user.avatar
    // DiceBear fallback
    return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.id}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ผู้ใช้งาน</h1>
          <p className="text-muted-foreground">ดูรายการผู้ใช้ทั้งหมดในระบบ</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem
          label="ผู้ใช้ทั้งหมด"
          value={`${total.toLocaleString()} คน`}
          icon={<Users className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="หน้าปัจจุบัน"
          value={`${page} / ${totalPages}`}
          icon={<Shield className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="ใช้งาน (หน้านี้)"
          value={`${activeCount} คน`}
          icon={<UserCheck className="h-3 w-3" />}
          isLoading={isLoading}
        />
        <MetricItem
          label="ไม่ใช้งาน (หน้านี้)"
          value={`${inactiveCount} คน`}
          icon={<UserX className="h-3 w-3" />}
          isLoading={isLoading}
        />
      </div>

      <Separator />

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหา email, username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.role || 'all'}
            onValueChange={(v) => {
              setFilters({ ...filters, role: v === 'all' ? undefined : (v as RoleType) })
              goToPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="บทบาท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value={ROLE.USER}>{ROLE_LABELS.user}</SelectItem>
              <SelectItem value={ROLE.ADMIN}>{ROLE_LABELS.admin}</SelectItem>
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
              <TableHead className="w-[60px]"></TableHead>
              <TableHead className="w-auto">ผู้ใช้</TableHead>
              <TableHead className="hidden md:table-cell w-[200px]">Email</TableHead>
              <TableHead className="hidden lg:table-cell w-[120px]">บทบาท</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">สถานะ</TableHead>
              <TableHead className="hidden xl:table-cell w-[140px]">เข้าร่วม</TableHead>
              <TableHead className="w-[60px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Users className="h-10 w-10" />
                    <div>
                      <p className="font-medium">ไม่พบผู้ใช้</p>
                      <p className="text-sm">ลองค้นหาด้วยคำอื่น</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((item) => (
                <TableRow key={item.id} className="group">
                  <TableCell className="p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getAvatarUrl(item)} alt={item.username} />
                      <AvatarFallback>{getInitials(item)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="p-2 overflow-hidden">
                    <Link to={`/users/${item.id}`} className="hover:underline">
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {item.displayName || `${item.firstName} ${item.lastName}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">@{item.username}</p>
                        <p className="text-xs text-muted-foreground md:hidden truncate">
                          {item.email}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell p-2">
                    <span className="text-sm text-muted-foreground truncate block">
                      {item.email}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell p-2">
                    <Badge className={ROLE_STYLES[item.role as RoleType] || 'status-muted'}>
                      {ROLE_LABELS[item.role as RoleType] || item.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell p-2">
                    {item.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ใช้งาน
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        ไม่ใช้งาน
                      </Badge>
                    )}
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
                        <DropdownMenuItem asChild>
                          <Link to={`/users/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            ดูรายละเอียด
                          </Link>
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

    </div>
  )
}
