package dto

import (
	"time"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// UserStatsResponse response สำหรับ user stats
type UserStatsResponse struct {
	ID               uuid.UUID  `json:"id"`
	UserID           uuid.UUID  `json:"userId"`
	XP               int        `json:"xp"`
	Level            int        `json:"level"`
	Title            string     `json:"title"`
	TitleGeneratedAt *time.Time `json:"titleGeneratedAt,omitempty"`
	TotalViews       int        `json:"totalViews"`
	TotalLikes       int        `json:"totalLikes"`
	TotalComments    int        `json:"totalComments"`
	LoginStreak      int        `json:"loginStreak"`
	PeakHour         int        `json:"peakHour"`
	XPProgress       float64    `json:"xpProgress"`    // % ความคืบหน้าใน level ปัจจุบัน
	XPToNextLevel    int        `json:"xpToNextLevel"` // XP ที่ต้องการสำหรับ level ถัดไป
	LevelBadge       string     `json:"levelBadge"`    // Badge icon ตาม level
}

// TitleHistoryResponse response สำหรับประวัติ title
type TitleHistoryResponse struct {
	ID       uuid.UUID `json:"id"`
	Level    int       `json:"level"`
	Title    string    `json:"title"`
	EarnedAt time.Time `json:"earnedAt"`
}

// AddXPRequest request สำหรับเพิ่ม XP
type AddXPRequest struct {
	XP     int    `json:"xp" validate:"required,min=1,max=1000"`
	Source string `json:"source" validate:"required"` // view, like, comment, login, etc.
}

// AddXPResponse response หลังจากเพิ่ม XP
type AddXPResponse struct {
	Stats    UserStatsResponse `json:"stats"`
	LeveledUp bool             `json:"leveledUp"`
	XPAdded  int               `json:"xpAdded"`
}

// Mapper functions

func UserStatsToResponse(stats *models.UserStats) *UserStatsResponse {
	if stats == nil {
		return nil
	}

	xpProgress := models.GetXPProgress(stats.XP, stats.Level)
	xpToNextLevel := models.GetXPForLevel(stats.Level+1) - stats.XP
	if xpToNextLevel < 0 {
		xpToNextLevel = 0
	}

	return &UserStatsResponse{
		ID:               stats.ID,
		UserID:           stats.UserID,
		XP:               stats.XP,
		Level:            stats.Level,
		Title:            stats.Title,
		TitleGeneratedAt: stats.TitleGeneratedAt,
		TotalViews:       stats.TotalViews,
		TotalLikes:       stats.TotalLikes,
		TotalComments:    stats.TotalComments,
		LoginStreak:      stats.LoginStreak,
		PeakHour:         stats.PeakHour,
		XPProgress:       xpProgress,
		XPToNextLevel:    xpToNextLevel,
		LevelBadge:       GetLevelBadge(stats.Level),
	}
}

func TitleHistoryToResponse(history *models.TitleHistory) *TitleHistoryResponse {
	if history == nil {
		return nil
	}
	return &TitleHistoryResponse{
		ID:       history.ID,
		Level:    history.Level,
		Title:    history.Title,
		EarnedAt: history.EarnedAt,
	}
}

func TitleHistoriesToResponse(histories []models.TitleHistory) []TitleHistoryResponse {
	result := make([]TitleHistoryResponse, len(histories))
	for i, h := range histories {
		result[i] = *TitleHistoryToResponse(&h)
	}
	return result
}

// GetLevelBadge returns badge emoji based on level
func GetLevelBadge(level int) string {
	switch {
	case level >= 99:
		return "👑" // Legend
	case level >= 75:
		return "💎" // Diamond
	case level >= 50:
		return "🥇" // Gold
	case level >= 25:
		return "🥈" // Silver
	case level >= 10:
		return "🥉" // Bronze
	default:
		return "⭐" // Starter
	}
}
