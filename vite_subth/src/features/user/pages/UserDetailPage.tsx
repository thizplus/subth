import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Award, Eye, Heart, MessageCircle, Flame, Clock, Activity, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useUserById, useUserStats, useUserActivity } from '@/features/user'
import { ROLE_LABELS, ROLE_STYLES, type RoleType } from '@/constants/enums'

const PAGE_TYPE_LABELS: Record<string, string> = {
  video: 'ดูวิดีโอ',
  cast: 'ดูนักแสดง',
  tag: 'ดูแท็ก',
  maker: 'ดูค่าย',
  category: 'ดูหมวดหมู่',
  search: 'ค้นหา',
  'ai-search': 'ค้นหา AI',
  reel: 'ดู Reel',
  feed: 'ดู Feed',
  profile: 'ดูโปรไฟล์',
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: user, isLoading: isLoadingUser } = useUserById(id || '')
  const { data: stats, isLoading: isLoadingStats } = useUserStats(id || '')
  const { data: activityData, isLoading: isLoadingActivity } = useUserActivity(id || '', {
    page: 1,
    limit: 20,
  })

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user?.username?.[0]?.toUpperCase() || '?'
  }

  const getAvatarUrl = () => {
    if (user?.avatar) return user.avatar
    return `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${id}`
  }

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ไม่พบ User ID</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">รายละเอียดผู้ใช้</h1>
          <p className="text-muted-foreground">ดูข้อมูล สถิติ และประวัติการใช้งาน</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ข้อมูลผู้ใช้</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={getAvatarUrl()} alt={user.username} />
                    <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {user.displayName || `${user.firstName} ${user.lastName}`}
                    </p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <Badge className={ROLE_STYLES[user.role as RoleType] || 'status-muted'}>
                      {ROLE_LABELS[user.role as RoleType] || user.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ชื่อ</span>
                    <span className="font-medium">{user.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">นามสกุล</span>
                    <span className="font-medium">{user.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">สถานะ</span>
                    {user.isActive ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ใช้งาน
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        ไม่ใช้งาน
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">เข้าร่วมเมื่อ</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">ไม่พบข้อมูลผู้ใช้</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              สถิติการใช้งาน
            </CardTitle>
            <CardDescription>XP, Level และสถิติต่างๆ</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Level & XP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{stats.levelBadge}</span>
                      <span className="font-semibold">Level {stats.level}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats.xp.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress value={stats.xpProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    อีก {stats.xpToNextLevel.toLocaleString()} XP ถึง Level {stats.level + 1}
                  </p>
                </div>

                {/* Title */}
                {stats.title && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">ฉายา</p>
                    <p className="font-medium text-lg">{stats.title}</p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Views
                    </p>
                    <p className="text-xl font-semibold tabular-nums">
                      {stats.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" /> Likes
                    </p>
                    <p className="text-xl font-semibold tabular-nums">
                      {stats.totalLikes.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> Comments
                    </p>
                    <p className="text-xl font-semibold tabular-nums">
                      {stats.totalComments.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3" /> Login Streak
                    </p>
                    <p className="text-xl font-semibold tabular-nums">
                      {stats.loginStreak} วัน
                    </p>
                  </div>
                </div>

                {/* Peak Hour */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>ช่วงเวลาที่ใช้บ่อยสุด: {stats.peakHour}:00 - {stats.peakHour + 1}:00 น.</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">ไม่พบข้อมูลสถิติ</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            ประวัติการใช้งาน
          </CardTitle>
          <CardDescription>
            รายการ activity ล่าสุด {activityData?.meta.total?.toLocaleString() || 0} รายการ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[120px]">ประเภท</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="w-[180px]">เวลา</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingActivity ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : activityData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <div className="text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>ยังไม่มีประวัติการใช้งาน</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activityData?.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="secondary">
                          {PAGE_TYPE_LABELS[log.pageType] || log.pageType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://subth.com${log.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 group"
                        >
                          <span className="truncate">{log.pageTitle || log.path}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {new Date(log.createdAt).toLocaleString('th-TH', {
                            year: 'numeric',
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

          {activityData && activityData.meta.total > 20 && (
            <div className="mt-4 text-center">
              <Link to={`/activity?userId=${id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  ดูทั้งหมด ({activityData.meta.total.toLocaleString()} รายการ)
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
