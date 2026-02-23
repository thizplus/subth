package models

import (
	"time"

	"github.com/google/uuid"
)

type Maker struct {
	ID         uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name       string    `gorm:"size:255;not null;index:makers_name_key,unique"`
	Slug       string    `gorm:"size:255;not null;index:makers_slug_key,unique"`
	VideoCount int       `gorm:"default:0"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
}

func (Maker) TableName() string {
	return "makers"
}
