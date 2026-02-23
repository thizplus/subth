package models

import (
	"time"

	"github.com/google/uuid"
)

type CastTranslation struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CastID    uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:cast_translations_cast_id_lang_key"`
	Lang      string    `gorm:"size:5;not null;uniqueIndex:cast_translations_cast_id_lang_key"`
	Name      string    `gorm:"size:255;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (CastTranslation) TableName() string {
	return "cast_translations"
}
