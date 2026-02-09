export interface UserStats {
  id: string;
  userId: string;
  xp: number;
  level: number;
  title: string;
  titleGeneratedAt?: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  loginStreak: number;
  peakHour: number;
  xpProgress: number;
  xpToNextLevel: number;
  levelBadge: string;
}

export interface TitleHistory {
  id: string;
  level: number;
  title: string;
  earnedAt: string;
}

export interface AddXPRequest {
  xp: number;
  source: string;
}

export interface AddXPResponse {
  stats: UserStats;
  leveledUp: boolean;
  xpAdded: number;
}

export interface RecordViewRequest {
  watchDuration: number;   // seconds watched
  watchPercent: number;    // 0-100
}

export interface RecordViewResponse {
  xpAwarded: boolean;
  xpAmount: number;
  totalXp: number;
  leveledUp: boolean;
  newLevel?: number;
}
