package models

import (
	"time"

	"github.com/google/uuid"
)

// ActivityLog บันทึกการเข้าถึงหน้าต่างๆ ของ user
type ActivityLog struct {
	ID        uuid.UUID  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    uuid.UUID  `gorm:"not null;index:idx_activity_logs_user;type:uuid"`
	User      *User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	PageType  string     `gorm:"type:varchar(50);not null;index:idx_activity_logs_page"` // video, cast, tag, maker, category, search, reel, feed
	PageID    *uuid.UUID `gorm:"type:uuid;index:idx_activity_logs_page"`                 // ID ของ resource (nullable)
	Path      string     `gorm:"type:varchar(500);not null"`                             // /member/videos/xxx
	Metadata  *string    `gorm:"type:jsonb"`                                             // ข้อมูลเพิ่มเติม เช่น search query
	IPAddress string     `gorm:"type:varchar(50)"`
	UserAgent string     `gorm:"type:text"`
	CreatedAt time.Time  `gorm:"autoCreateTime;index:idx_activity_logs_created"`
}

func (ActivityLog) TableName() string {
	return "activity_logs"
}

// PageType constants
const (
	PageTypeVideo    = "video"
	PageTypeCast     = "cast"
	PageTypeTag      = "tag"
	PageTypeMaker    = "maker"
	PageTypeCategory = "category"
	PageTypeSearch   = "search"
	PageTypeAISearch = "ai-search"
	PageTypeReel     = "reel"
	PageTypeFeed     = "feed"
	PageTypeProfile  = "profile"
)
