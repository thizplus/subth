"use client";

import { useAuthStore } from "@/features/auth";
import { useMyStats } from "@/features/user-stats";
import { useMyActivityHistory } from "@/features/activity";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Share2, History, Video, User, Tag, Search, Home, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: stats, isLoading, error } = useMyStats();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
      </div>
    );
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">ไม่สามารถโหลดข้อมูลได้</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header Actions */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Profile Header - Always visible */}
      <div className="flex flex-col items-center text-center mb-6">
        {/* Avatar */}
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-3xl">
            {user?.displayName?.slice(0, 2) || "TH"}
          </AvatarFallback>
        </Avatar>

        {/* Name & Badge */}
        <h1 className="text-xl font-bold mb-1">{user?.displayName}</h1>

        {/* Level Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{stats.levelBadge}</span>
          <span className="text-lg font-semibold">Lv.{stats.level}</span>
        </div>

        {/* Title */}
        {stats.title && (
          <p className="text-sm text-primary font-medium mb-3">"{stats.title}"</p>
        )}

        {/* XP Bar */}
        <div className="w-full max-w-xs mb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{stats.xp.toLocaleString()} XP</span>
            <span>อีก {stats.xpToNextLevel.toLocaleString()} XP</span>
          </div>
          <Progress value={stats.xpProgress} className="h-2" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            ภาพรวม
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            ประวัติ
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 border-y py-4">
            <StatItem value={stats.totalViews} label="ดูวิดีโอ" />
            <StatItem value={stats.totalLikes} label="ถูกใจ" className="border-x" />
            <StatItem value={stats.totalComments} label="คอมเมนต์" />
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-2xl font-bold">{stats.loginStreak}</div>
              <div className="text-xs text-muted-foreground">วันเข้าเว็บติดต่อกัน</div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <div className="text-3xl mb-1">⏰</div>
              <div className="text-2xl font-bold">
                {stats.peakHour?.toString().padStart(2, "0") || "00"}:00
              </div>
              <div className="text-xs text-muted-foreground">ช่วงเวลาโปรด</div>
            </div>
          </div>

          {/* Rank Progress */}
          <div>
            <h3 className="text-sm font-semibold mb-3">ระดับยศ</h3>
            <div className="flex justify-between items-center">
              <RankBadge badge="⭐" active={stats.level < 10} />
              <div className="flex-1 h-1 bg-muted mx-1">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: stats.level >= 10 ? '100%' : `${(stats.level / 10) * 100}%` }}
                />
              </div>
              <RankBadge badge="🥉" active={stats.level >= 10 && stats.level < 25} />
              <div className="flex-1 h-1 bg-muted mx-1">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: stats.level >= 25 ? '100%' : stats.level >= 10 ? `${((stats.level - 10) / 15) * 100}%` : '0%' }}
                />
              </div>
              <RankBadge badge="🥈" active={stats.level >= 25 && stats.level < 50} />
              <div className="flex-1 h-1 bg-muted mx-1">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: stats.level >= 50 ? '100%' : stats.level >= 25 ? `${((stats.level - 25) / 25) * 100}%` : '0%' }}
                />
              </div>
              <RankBadge badge="🥇" active={stats.level >= 50 && stats.level < 75} />
              <div className="flex-1 h-1 bg-muted mx-1">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: stats.level >= 75 ? '100%' : stats.level >= 50 ? `${((stats.level - 50) / 25) * 100}%` : '0%' }}
                />
              </div>
              <RankBadge badge="💎" active={stats.level >= 75 && stats.level < 99} />
              <div className="flex-1 h-1 bg-muted mx-1">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: stats.level >= 99 ? '100%' : stats.level >= 75 ? `${((stats.level - 75) / 24) * 100}%` : '0%' }}
                />
              </div>
              <RankBadge badge="👑" active={stats.level >= 99} />
            </div>
          </div>

          {/* XP Guide */}
          <div className="bg-muted/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3">วิธีรับ XP</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ดูวิดีโอ (30 วิ+)</span>
                <span className="font-medium">+5 XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">กดถูกใจ</span>
                <span className="font-medium">+2 XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">แสดงความคิดเห็น</span>
                <span className="font-medium">+10 XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">เข้าเว็บรายวัน</span>
                <span className="font-medium">+15 XP</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <ActivityHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatItem({
  value,
  label,
  className = ""
}: {
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <div className="text-xl font-bold">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function RankBadge({ badge, active }: { badge: string; active: boolean }) {
  return (
    <div className={`text-xl transition-all ${active ? 'scale-125' : 'opacity-40 grayscale'}`}>
      {badge}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex flex-col items-center mb-6">
        <Skeleton className="h-24 w-24 rounded-full mb-4" />
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-5 w-20 mb-2" />
        <Skeleton className="h-4 w-48 mb-4" />
        <Skeleton className="h-2 w-64" />
      </div>
      <Skeleton className="h-10 w-full mb-4" />
      <div className="grid grid-cols-3 border-y py-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

// Page type icons and labels
const PAGE_TYPE_CONFIG: Record<string, { icon: typeof Video; label: string; href: (id?: string) => string }> = {
  video: { icon: Video, label: "วิดีโอ", href: (id) => `/member/videos/${id}` },
  cast: { icon: User, label: "นักแสดง", href: (id) => `/member/casts/${id}` },
  tag: { icon: Tag, label: "แท็ก", href: (id) => `/member/tags/${id}` },
  maker: { icon: Video, label: "ค่าย", href: (id) => `/member/makers/${id}` },
  search: { icon: Search, label: "ค้นหา", href: () => "/member/search" },
  "ai-search": { icon: Search, label: "AI ค้นหา", href: () => "/member/ai-search" },
  feed: { icon: Home, label: "หน้าแรก", href: () => "/" },
  reel: { icon: Video, label: "Reel", href: (id) => `/reels?id=${id}` },
  profile: { icon: User, label: "โปรไฟล์", href: () => "/member/profile" },
  category: { icon: Tag, label: "หมวดหมู่", href: (id) => `/member/category/${id}` },
};

function ActivityHistoryTab() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyActivityHistoryInfinite();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const activities = data?.pages.flatMap(page => page.data) ?? [];

  if (!activities.length) {
    return (
      <div className="text-center py-12">
        <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">ยังไม่มีประวัติการเข้าชม</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => {
        const config = PAGE_TYPE_CONFIG[activity.pageType] || PAGE_TYPE_CONFIG.video;
        const Icon = config.icon;
        const href = activity.pageId ? config.href(activity.pageId) : config.href();

        // Parse metadata for search query
        let displayText = config.label;
        if (activity.pageType === "search" && activity.metadata) {
          try {
            const meta = JSON.parse(activity.metadata);
            if (meta.query) displayText = `"${meta.query}"`;
          } catch {
            // ignore
          }
        }

        return (
          <Link
            key={activity.id}
            href={href}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="p-2 rounded-full bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayText}</p>
              <p className="text-xs text-muted-foreground truncate">{activity.path}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(activity.createdAt)}
            </span>
          </Link>
        );
      })}

      {/* Load More */}
      {hasNextPage && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "กำลังโหลด..." : "โหลดเพิ่มเติม"}
        </Button>
      )}
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "เมื่อกี้";
  if (diffMins < 60) return `${diffMins} นาที`;
  if (diffHours < 24) return `${diffHours} ชม.`;
  if (diffDays < 7) return `${diffDays} วัน`;
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

// Infinite scroll hook for activity history
function useMyActivityHistoryInfinite() {
  const { data, isLoading } = useMyActivityHistory(1, 20);

  // For now, return simple pagination structure
  // TODO: Implement proper infinite query
  return {
    data: data ? { pages: [data] } : undefined,
    isLoading,
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
  };
}
