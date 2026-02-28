package models

import (
	"time"

	"github.com/google/uuid"
)

// ArticleLike - การกด like บทความ
type ArticleLike struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    uuid.UUID `gorm:"not null;index;type:uuid;uniqueIndex:idx_article_like_user_article"`
	User      *User     `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ArticleID uuid.UUID `gorm:"not null;index;type:uuid;uniqueIndex:idx_article_like_user_article"`
	Article   *Article  `gorm:"foreignKey:ArticleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (ArticleLike) TableName() string {
	return "article_likes"
}
