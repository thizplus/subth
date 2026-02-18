import { useOnlineUsers } from '../hooks'
import { getCdnUrl } from '@/constants'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OnlineUsersPage() {
  const { data: users, isLoading, refetch, isFetching } = useOnlineUsers()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ผู้ใช้ออนไลน์</h1>
          <p className="text-muted-foreground">
            รายชื่อผู้ใช้ที่กำลังออนไลน์อยู่ในระบบแชท
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            ออนไลน์ตอนนี้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-500">
            {isLoading ? <Skeleton className="h-9 w-16" /> : users?.length || 0}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            อัปเดตอัตโนมัติทุก 10 วินาที
          </p>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <Card>
        <CardHeader>
          <CardTitle>รายชื่อผู้ใช้</CardTitle>
          <CardDescription>
            ผู้ใช้ที่เชื่อมต่อ WebSocket กับห้องแชท
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={getCdnUrl(user.avatar)} />
                      <AvatarFallback>
                        {user.displayName?.slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.displayName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{user.levelBadge}</span>
                      <span>Lv.{user.level}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    Online
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>ไม่มีผู้ใช้ออนไลน์</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
