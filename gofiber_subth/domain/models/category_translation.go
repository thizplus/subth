package models

import (
	"time"

	"github.com/google/uuid"
)

type CategoryTranslation struct {
	ID         uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CategoryID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:idx_category_lang"`
	Lang       string    `gorm:"size:5;not null;uniqueIndex:idx_category_lang"`
	Name       string    `gorm:"size:100;not null"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}

func (CategoryTranslation) TableName() string {
	return "category_translations"
}
