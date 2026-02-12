package models

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID           uuid.UUID             `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string                `gorm:"uniqueIndex;size:100;not null"`
	Slug         string                `gorm:"uniqueIndex;size:100;not null"`
	SortOrder    int                   `gorm:"default:0;index"`
	VideoCount   int                   `gorm:"default:0"`
	Translations []CategoryTranslation `gorm:"foreignKey:CategoryID"`
	CreatedAt    time.Time             `gorm:"autoCreateTime"`
	UpdatedAt    time.Time             `gorm:"autoUpdateTime"`
}

func (Category) TableName() string {
	return "categories"
}
