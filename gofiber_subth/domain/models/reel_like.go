package models

import (
	"time"

	"github.com/google/uuid"
)

type ReelLike struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index"`
	ReelID    uuid.UUID `gorm:"type:uuid;not null;index"`
	CreatedAt time.Time `gorm:"autoCreateTime"`

	// Relations
	User *User `gorm:"foreignKey:UserID"`
	Reel *Reel `gorm:"foreignKey:ReelID"`
}

func (ReelLike) TableName() string {
	return "reel_likes"
}
