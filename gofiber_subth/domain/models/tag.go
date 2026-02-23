package models

import (
	"time"

	"github.com/google/uuid"
)

type Tag struct {
	ID           uuid.UUID        `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string           `gorm:"size:255;not null;uniqueIndex:tags_name_key"`
	Slug         string           `gorm:"size:255;not null;uniqueIndex:tags_slug_key"`
	VideoCount   int              `gorm:"default:0"`
	Translations []TagTranslation `gorm:"foreignKey:TagID"`
	CreatedAt    time.Time        `gorm:"autoCreateTime"`
}

func (Tag) TableName() string {
	return "tags"
}
