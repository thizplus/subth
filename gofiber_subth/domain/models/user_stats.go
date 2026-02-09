package models

import (
	"time"

	"github.com/google/uuid"
)

// UserStats เก็บสถิติและระดับของผู้ใช้
type UserStats struct {
	ID               uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID           uuid.UUID `gorm:"uniqueIndex;not null;type:uuid"`
	User             *User     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	XP               int       `gorm:"default:0"`
	Level            int       `gorm:"default:1"`
	Title            string    `gorm:"size:255"` // AI-generated title
	TitleGeneratedAt *time.Time
	TotalViews       int `gorm:"default:0"`
	TotalLikes       int `gorm:"default:0"`
	TotalComments    int `gorm:"default:0"`
	LoginStreak      int `gorm:"default:0"`
	PeakHour         int `gorm:"default:0"` // ชั่วโมงที่ดูบ่อยสุด (0-23)
	LastLoginAt      *time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func (UserStats) TableName() string {
	return "user_stats"
}

// CalculateLevel คำนวณ level จาก XP
// XP required = level * 100 + (level^2 * 10)
func CalculateLevelFromXP(xp int) int {
	level := 1
	totalXPRequired := 0
	for level < 99 {
		xpForNextLevel := level*100 + (level * level * 10)
		if totalXPRequired+xpForNextLevel > xp {
			break
		}
		totalXPRequired += xpForNextLevel
		level++
	}
	return level
}

// GetXPForLevel คำนวณ XP ที่ต้องการสำหรับ level นั้นๆ
func GetXPForLevel(level int) int {
	totalXP := 0
	for l := 1; l < level; l++ {
		totalXP += l*100 + (l * l * 10)
	}
	return totalXP
}

// GetXPProgress คำนวณ % ความคืบหน้าใน level ปัจจุบัน
func GetXPProgress(xp int, level int) float64 {
	currentLevelXP := GetXPForLevel(level)
	nextLevelXP := GetXPForLevel(level + 1)
	xpInCurrentLevel := xp - currentLevelXP
	xpNeededForNext := nextLevelXP - currentLevelXP
	if xpNeededForNext <= 0 {
		return 100.0
	}
	progress := float64(xpInCurrentLevel) / float64(xpNeededForNext) * 100
	if progress > 100 {
		return 100.0
	}
	return progress
}

// TitleHistory เก็บประวัติฉายาที่เคยได้รับ
type TitleHistory struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"index;not null;type:uuid"`
	User      *User     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Level     int       `gorm:"not null"`
	Title     string    `gorm:"size:255;not null"`
	EarnedAt  time.Time `gorm:"not null"`
	CreatedAt time.Time
}

func (TitleHistory) TableName() string {
	return "title_history"
}
