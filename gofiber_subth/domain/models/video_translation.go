package models

import (
	"time"

	"github.com/google/uuid"
)

type VideoTranslation struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	VideoID   uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_video_lang"`
	Lang      string    `gorm:"size:5;not null;uniqueIndex:idx_video_lang"`
	Title     string    `gorm:"type:text;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (VideoTranslation) TableName() string {
	return "video_translations"
}
