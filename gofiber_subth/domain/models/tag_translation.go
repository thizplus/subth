package models

import (
	"time"

	"github.com/google/uuid"
)

type TagTranslation struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	TagID     uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:tag_translations_tag_id_lang_key"`
	Lang      string    `gorm:"size:5;not null;uniqueIndex:tag_translations_tag_id_lang_key"`
	Name      string    `gorm:"size:255;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (TagTranslation) TableName() string {
	return "tag_translations"
}
