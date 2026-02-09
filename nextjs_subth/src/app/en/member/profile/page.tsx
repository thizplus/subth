"use client";

import { useAuthStore } from "@/features/auth";
import { useMyStats } from "@/features/user-stats";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Share2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: stats, isLoading, error } = useMyStats();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Please login to view profile</p>
      </div>
    );
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Failed to load data</p>
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

      {/* Profile Section */}
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
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{stats.xp.toLocaleString()} XP</span>
            <span>{stats.xpToNextLevel.toLocaleString()} XP to next</span>
          </div>
          <Progress value={stats.xpProgress} className="h-2" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 border-y py-4 mb-6">
        <StatItem value={stats.totalViews} label="Watched" />
        <StatItem value={stats.totalLikes} label="Likes" className="border-x" />
        <StatItem value={stats.totalComments} label="Comments" />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold">{stats.loginStreak}</div>
          <div className="text-xs text-muted-foreground">Daily Visit Streak</div>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">⏰</div>
          <div className="text-2xl font-bold">
            {stats.peakHour?.toString().padStart(2, "0") || "00"}:00
          </div>
          <div className="text-xs text-muted-foreground">Peak Hour</div>
        </div>
      </div>

      {/* Rank Progress */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3">Rank Progress</h3>
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
        <h3 className="text-sm font-semibold mb-3">How to earn XP</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Watch video (30s+)</span>
            <span className="font-medium">+5 XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Like</span>
            <span className="font-medium">+2 XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Comment</span>
            <span className="font-medium">+10 XP</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Daily visit</span>
            <span className="font-medium">+15 XP</span>
          </div>
        </div>
      </div>
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
