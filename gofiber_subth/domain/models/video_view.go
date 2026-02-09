package models

import (
	"time"

	"github.com/google/uuid"
)

// VideoView บันทึกการดู video/reel
type VideoView struct {
	ID            uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID        uuid.UUID `gorm:"not null;index:idx_video_views_user_reel;type:uuid"`
	User          *User     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ReelID        uuid.UUID `gorm:"not null;index:idx_video_views_user_reel;type:uuid"`
	Reel          *Reel     `gorm:"foreignKey:ReelID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	WatchDuration int       `gorm:"default:0"` // วินาทีที่ดู
	WatchPercent  float64   `gorm:"default:0"` // % ที่ดู
	XPAwarded     bool      `gorm:"default:false;index"`
	CreatedAt     time.Time `gorm:"autoCreateTime"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"`
}

func (VideoView) TableName() string {
	return "video_views"
}

// CanAwardXP ตรวจสอบว่าสามารถให้ XP ได้หรือไม่
// ต้องดูอย่างน้อย 30 วินาที หรือ 50% ของ video
func (v *VideoView) CanAwardXP(videoDuration int) bool {
	if v.XPAwarded {
		return false
	}
	// ดู >= 30 วินาที หรือ >= 50%
	return v.WatchDuration >= 30 || v.WatchPercent >= 50.0
}
