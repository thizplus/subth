package models

import (
	"time"

	"github.com/google/uuid"
)

// ArticleComment - ความคิดเห็นในบทความ
type ArticleComment struct {
	ID        uuid.UUID  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    uuid.UUID  `gorm:"not null;index;type:uuid"`
	User      *User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ArticleID uuid.UUID  `gorm:"not null;index;type:uuid"`
	Article   *Article   `gorm:"foreignKey:ArticleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ParentID  *uuid.UUID `gorm:"type:uuid;index"` // For replies
	Parent    *ArticleComment `gorm:"foreignKey:ParentID"`
	Content   string     `gorm:"type:text;not null"`
	CreatedAt time.Time  `gorm:"autoCreateTime"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime"`
}

func (ArticleComment) TableName() string {
	return "article_comments"
}
