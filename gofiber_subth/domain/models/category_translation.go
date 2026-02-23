package models

import (
	"time"

	"github.com/google/uuid"
)

type CategoryTranslation struct {
	ID         uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CategoryID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:category_translations_category_id_lang_key"`
	Lang       string    `gorm:"size:5;not null;uniqueIndex:category_translations_category_id_lang_key"`
	Name       string    `gorm:"size:100;not null"`
	CreatedAt  time.Time `gorm:"autoCreateTime"`
}

func (CategoryTranslation) TableName() string {
	return "category_translations"
}
