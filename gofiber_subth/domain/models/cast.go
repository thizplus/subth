package models

import (
	"time"

	"github.com/google/uuid"
)

type Cast struct {
	ID           uuid.UUID         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string            `gorm:"uniqueIndex:casts_name_key;size:255;not null"`
	Slug         string            `gorm:"uniqueIndex:casts_slug_key;size:255;not null"`
	VideoCount   int               `gorm:"default:0"`
	Translations []CastTranslation `gorm:"foreignKey:CastID"`
	CreatedAt    time.Time         `gorm:"autoCreateTime"`
	UpdatedAt    time.Time         `gorm:"autoUpdateTime"`
}

func (Cast) TableName() string {
	return "casts"
}
