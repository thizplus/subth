package models

import (
	"time"

	"github.com/google/uuid"
)

type CastTranslation struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	CastID    uuid.UUID `gorm:"type:uuid;not null;index"`
	Lang      string    `gorm:"size:5;not null;index"`
	Name      string    `gorm:"size:255;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (CastTranslation) TableName() string {
	return "cast_translations"
}
