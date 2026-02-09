import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Video,
  Users,
  Eye,
  Search,
  TrendingUp,
  Loader2,
  ExternalLink,
  BarChart3,
  Film,
  UserRound,
  Tags,
  Factory
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  video: { label: 'วิดีโอ', icon: <Film className="h-4 w-4" />, color: 'text-blue-500' },
  cast: { label: 'นักแสดง', icon: <UserRound className="h-4 w-4" />, color: 'text-pink-500' },
  tag: { label: 'แท็ก', icon: <Tags className="h-4 w-4" />, color: 'text-green-500' },
  maker: { label: 'ค่าย', icon: <Factory className="h-4 w-4" />, color: 'text-orange-500' },
  search: { label: 'ค้นหา', icon: <Search className="h-4 w-4" />, color: 'text-purple-500' },
  'ai-search': { label: 'AI Search', icon: <Search className="h-4 w-4" />, color: 'text-indigo-500' },
  reel: { label: 'Reels', icon: <Video className="h-4 w-4" />, color: 'text-red-500' },
  feed: { label: 'Feed', icon: <BarChart3 className="h-4 w-4" />, color: 'text-cyan-500' },
}

interface PopularListProps {
  title: string
  icon: React.ReactNode
  data: PopularPage[] | undefined
  isLoading: boolean
  linkPrefix?: string
}

function PopularList({ title, icon, data, isLoading, linkPrefix }: PopularListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข้อมูล</p>
        ) : (
          <div className="space-y-2">
            {data.map((item, index) => (
              <div
                key={item.pageId}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-muted-foreground w-4">{index + 1}.</span>
                  {linkPrefix ? (
                    <Link
                      to={`${linkPrefix}/${item.pageId}`}
                      className="truncate hover:underline"
                    >
                      {item.pageId.slice(0, 8)}...
                    </Link>
                  ) : (
                    <span className="truncate font-mono text-xs">
                      {item.pageId.slice(0, 8)}...
                    </span>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {item.viewCount.toLocaleString()} views
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">ภาพรวมและสถิติการใช้งาน</p>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-[160px]">
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ผู้ใช้ทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{usersData?.meta.total.toLocaleString() || 0}</div>
                <Link to="/users" className="text-xs text-muted-foreground hover:underline">
                  ดูทั้งหมด
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views ({days} วัน)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">จากทุกหน้า</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Log</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <Link to="/activity" className="text-xs text-muted-foreground hover:underline">
              ดู Activity
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ช่วงเวลา</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : summary ? (
              <>
                <div className="text-sm font-medium">
                  {new Date(summary.startDate).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short'
                  })}
                  {' - '}
                  {new Date(summary.endDate).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{days} วันที่ผ่านมา</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">-</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Page Type Summary */}
      <div>
        <h2 className="text-lg font-semibold mb-4">สรุปตามประเภท</h2>
        <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-8">
          {Object.entries(PAGE_TYPE_CONFIG).map(([type, config]) => {
            const data = summary?.summary?.[type] || []
            const total = data.reduce((sum, p) => sum + p.viewCount, 0)

            return (
              <Card key={type} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={config.color}>{config.icon}</span>
                  <span className="text-xs font-medium">{config.label}</span>
                </div>
                <div className="text-lg font-bold tabular-nums">
                  {isLoadingSummary ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    total.toLocaleString()
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Popular Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">เนื้อหายอดนิยม (Top 5)</h2>
          <Link to="/activity">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              ดู Activity ทั้งหมด
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PopularList
            title="วิดีโอยอดนิยม"
            icon={<Film className="h-4 w-4 text-blue-500" />}
            data={summary?.summary?.video}
            isLoading={isLoadingSummary}
            linkPrefix="/videos"
          />
          <PopularList
            title="นักแสดงยอดนิยม"
            icon={<UserRound className="h-4 w-4 text-pink-500" />}
            data={summary?.summary?.cast}
            isLoading={isLoadingSummary}
            linkPrefix="/casts"
          />
          <PopularList
            title="แท็กยอดนิยม"
            icon={<Tags className="h-4 w-4 text-green-500" />}
            data={summary?.summary?.tag}
            isLoading={isLoadingSummary}
            linkPrefix="/tags"
          />
          <PopularList
            title="ค่ายยอดนิยม"
            icon={<Factory className="h-4 w-4 text-orange-500" />}
            data={summary?.summary?.maker}
            isLoading={isLoadingSummary}
            linkPrefix="/makers"
          />
        </div>
      </div>
    </div>
  )
}
