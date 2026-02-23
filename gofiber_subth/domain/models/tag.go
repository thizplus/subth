package models

import (
	"time"

	"github.com/google/uuid"
)

type Tag struct {
	ID           uuid.UUID        `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string           `gorm:"size:255;not null;uniqueIndex:uni_tags_name"`
	Slug         string           `gorm:"size:255;not null;uniqueIndex:uni_tags_slug"`
	VideoCount   int              `gorm:"default:0"`
	Translations []TagTranslation `gorm:"foreignKey:TagID"`
	CreatedAt    time.Time        `gorm:"autoCreateTime"`
}

func (Tag) TableName() string {
	return "tags"
}
