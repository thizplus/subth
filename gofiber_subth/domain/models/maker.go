package models

import (
	"time"

	"github.com/google/uuid"
)

type Maker struct {
	ID         uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name       string    `gorm:"size:255;not null;uniqueIndex:makers_name_key"`
	Slug       string    `gorm:"size:255;not null;uniqueIndex:makers_slug_key"`
	VideoCount int       `gorm:"default:0"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
}

func (Maker) TableName() string {
	return "makers"
}
