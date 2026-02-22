import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Eye,
  Loader2,
  ExternalLink,
  BarChart3,
  Film,
  UserRound,
  Tags,
  Factory,
  Search,
  Video,
  Calendar,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import { useActivitySummary, useUserList, type PopularPage } from '@/features/user'

const PAGE_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  video: { label: 'วิดีโอ', icon: <Film className="h-3.5 w-3.5" />, color: 'text-blue-500' },
  cast: { label: 'นักแสดง', icon: <UserRound className="h-3.5 w-3.5" />, color: 'text-pink-500' },
  tag: { label: 'แท็ก', icon: <Tags className="h-3.5 w-3.5" />, color: 'text-green-500' },
  maker: { label: 'ค่าย', icon: <Factory className="h-3.5 w-3.5" />, color: 'text-orange-500' },
  search: { label: 'ค้นหา', icon: <Search className="h-3.5 w-3.5" />, color: 'text-purple-500' },
  'ai-search': { label: 'AI', icon: <Search className="h-3.5 w-3.5" />, color: 'text-indigo-500' },
  reel: { label: 'Reels', icon: <Video className="h-3.5 w-3.5" />, color: 'text-red-500' },
  feed: { label: 'Feed', icon: <BarChart3 className="h-3.5 w-3.5" />, color: 'text-cyan-500' },
}

// MetricItem - Compact stat display
interface MetricItemProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  isLoading?: boolean
  href?: string
}

function MetricItem({ label, value, icon, isLoading, href }: MetricItemProps) {
  const content = (
    <div className="space-y-0.5">
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

  if (href) {
    return (
      <Link to={href} className="hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors">
        {content}
      </Link>
    )
  }
  return content
}

// TypeStat - Mini stat for page types
interface TypeStatProps {
  type: string
  config: { label: string; icon: React.ReactNode; color: string }
  value: number
  isLoading: boolean
}

function TypeStat({ config, value, isLoading }: TypeStatProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <span className={config.color}>{config.icon}</span>
      <span className="text-xs text-muted-foreground">{config.label}</span>
      {isLoading ? (
        <Skeleton className="h-4 w-8 ml-auto" />
      ) : (
        <span className="text-sm font-semibold tabular-nums ml-auto">
          {value.toLocaleString()}
        </span>
      )}
    </div>
  )
}

// PopularRow - Single row for popular item
interface PopularRowProps {
  index: number
  item: PopularPage
  linkPrefix?: string
}

function PopularRow({ index, item, linkPrefix }: PopularRowProps) {
  const displayTitle = item.pageTitle || item.pageId.slice(0, 12) + '...'

  return (
    <div className="flex items-center gap-2 text-sm py-1">
      <span className="text-muted-foreground w-4 text-xs">{index + 1}.</span>
      {linkPrefix ? (
        <Link
          to={`${linkPrefix}/${item.pageId}`}
          className="truncate hover:underline text-xs flex-1 min-w-0"
          title={item.pageTitle || item.pageId}
        >
          {displayTitle}
        </Link>
      ) : (
        <span className="truncate text-xs flex-1 min-w-0" title={item.pageTitle || item.pageId}>
          {displayTitle}
        </span>
      )}
      <Badge variant="secondary" className="ml-auto text-xs tabular-nums shrink-0">
        {item.viewCount.toLocaleString()}
      </Badge>
    </div>
  )
}

export function AdminDashboard() {
  const [days, setDays] = useState(7)

  const { data: summary, isLoading: isLoadingSummary } = useActivitySummary(days)
  const { data: usersData, isLoading: isLoadingUsers } = useUserList({ page: 1, limit: 1 })

  // Calculate totals
  const totalViews = summary?.summary
    ? Object.values(summary.summary).reduce(
        (acc, pages) => acc + pages.reduce((sum, p) => sum + p.viewCount, 0),
        0
      )
    : 0

  const dateRange = summary
    ? `${new Date(summary.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - ${new Date(summary.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`
    : '-'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมและสถิติการใช้งาน</p>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">24 ชั่วโมง</SelectItem>
            <SelectItem value="7">7 วัน</SelectItem>
            <SelectItem value="30">30 วัน</SelectItem>
            <SelectItem value="90">90 วัน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats - Matrix style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricItem
          label="ผู้ใช้ทั้งหมด"
          value={usersData?.meta.total.toLocaleString() || '0'}
          icon={<Users className="h-3 w-3" />}
          isLoading={isLoadingUsers}
          href="/users"
        />
        <MetricItem
          label={`Views (${days} วัน)`}
          value={totalViews.toLocaleString()}
          icon={<Eye className="h-3 w-3" />}
          isLoading={isLoadingSummary}
        />
        <MetricItem
          label="Activity Log"
          value="ดูทั้งหมด →"
          icon={<BarChart3 className="h-3 w-3" />}
          href="/activity"
        />
        <MetricItem
          label="ช่วงเวลา"
          value={dateRange}
          icon={<Calendar className="h-3 w-3" />}
          isLoading={isLoadingSummary}
        />
      </div>

      <Separator />

      {/* Page Type Stats - Inline matrix */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Views ตามประเภท</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1 bg-muted/30 rounded-lg p-1">
          {Object.entries(PAGE_TYPE_CONFIG).map(([type, config]) => {
            const data = summary?.summary?.[type] || []
            const total = data.reduce((sum, p) => sum + p.viewCount, 0)
            return (
              <TypeStat
                key={type}
                type={type}
                config={config}
                value={total}
                isLoading={isLoadingSummary}
              />
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Popular Content - Compact grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">เนื้อหายอดนิยม (Top 5)</h2>
          <Link to="/activity">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <ExternalLink className="mr-1 h-3 w-3" />
              Activity
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Videos */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-500 mb-2">
              <Film className="h-3.5 w-3.5" />
              วิดีโอ
            </div>
            {isLoadingSummary ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))
            ) : summary?.summary?.video?.length ? (
              summary.summary.video.slice(0, 5).map((item, i) => (
                <PopularRow key={item.pageId} index={i} item={item} linkPrefix="/videos" />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูล</p>
            )}
          </div>

          {/* Casts */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-pink-500 mb-2">
              <UserRound className="h-3.5 w-3.5" />
              นักแสดง
            </div>
            {isLoadingSummary ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))
            ) : summary?.summary?.cast?.length ? (
              summary.summary.cast.slice(0, 5).map((item, i) => (
                <PopularRow key={item.pageId} index={i} item={item} linkPrefix="/casts" />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูล</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-500 mb-2">
              <Tags className="h-3.5 w-3.5" />
              แท็ก
            </div>
            {isLoadingSummary ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))
            ) : summary?.summary?.tag?.length ? (
              summary.summary.tag.slice(0, 5).map((item, i) => (
                <PopularRow key={item.pageId} index={i} item={item} linkPrefix="/tags" />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูล</p>
            )}
          </div>

          {/* Makers */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500 mb-2">
              <Factory className="h-3.5 w-3.5" />
              ค่าย
            </div>
            {isLoadingSummary ? (
              [...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))
            ) : summary?.summary?.maker?.length ? (
              summary.summary.maker.slice(0, 5).map((item, i) => (
                <PopularRow key={item.pageId} index={i} item={item} linkPrefix="/makers" />
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
