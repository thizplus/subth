package models

import (
	"time"

	"github.com/google/uuid"
)

type ReelComment struct {
	ID        uuid.UUID  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index"`
	ReelID    uuid.UUID  `gorm:"type:uuid;not null;index"`
	ParentID  *uuid.UUID `gorm:"type:uuid;index"` // สำหรับ reply comment (nullable)
	Content   string     `gorm:"type:text;not null"`
	CreatedAt time.Time  `gorm:"autoCreateTime"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime"`

	// Relations
	User    *User          `gorm:"foreignKey:UserID"`
	Reel    *Reel          `gorm:"foreignKey:ReelID"`
	Parent  *ReelComment   `gorm:"foreignKey:ParentID"`
	Replies []ReelComment  `gorm:"foreignKey:ParentID"`
}

func (ReelComment) TableName() string {
	return "reel_comments"
}
