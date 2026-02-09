package models

import (
	"time"

	"github.com/google/uuid"
)

type Reel struct {
	ID            uuid.UUID  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	VideoID       *uuid.UUID `gorm:"type:uuid;index"` // FK เชื่อมกับ video ต้นทาง (nullable)
	CoverURL      string     `gorm:"size:500"`        // files.subth.com/reels/{id}/cover.jpg
	VideoURL      string     `gorm:"size:500"`        // files.subth.com/reels/{id}/output.mp4
	ThumbURL      string     `gorm:"size:500"`        // files.subth.com/reels/{id}/thumb.jpg
	Title         string     `gorm:"size:500"`        // ค่อยใส่ทีหลังได้
	Description   string     `gorm:"type:text"`       // ค่อยใส่ทีหลังได้
	IsActive      bool       `gorm:"default:true"`    // แสดงใน feed/reels หรือไม่
	LikesCount    int        `gorm:"default:0"`       // cache จำนวน likes
	CommentsCount int        `gorm:"default:0"`       // cache จำนวน comments

	// Relations
	Video    *Video        `gorm:"foreignKey:VideoID"`
	Likes    []ReelLike    `gorm:"foreignKey:ReelID"`
	Comments []ReelComment `gorm:"foreignKey:ReelID"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (Reel) TableName() string {
	return "reels"
}
