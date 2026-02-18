package models

import (
	"time"

	"github.com/google/uuid"
)

// ChatMessage ข้อความในห้องแชท
type ChatMessage struct {
	ID               uuid.UUID    `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID           uuid.UUID    `gorm:"not null;index;type:uuid"`
	User             *User        `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Content          string       `gorm:"type:text;not null"`
	MentionedVideoID *uuid.UUID   `gorm:"type:uuid;index"`
	MentionedVideo   *Video       `gorm:"foreignKey:MentionedVideoID"`
	ReplyToID        *uuid.UUID   `gorm:"type:uuid"`
	ReplyTo          *ChatMessage `gorm:"foreignKey:ReplyToID"`
	IsDeleted        bool         `gorm:"default:false"`
	CreatedAt        time.Time    `gorm:"autoCreateTime;index"`
}

func (ChatMessage) TableName() string {
	return "chat_messages"
}

// ChatBan ข้อมูลการแบน user จากแชท
type ChatBan struct {
	ID        uuid.UUID  `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID    uuid.UUID  `gorm:"not null;uniqueIndex;type:uuid"`
	User      *User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Reason    string     `gorm:"type:text"`
	BannedBy  *uuid.UUID `gorm:"type:uuid"`
	BannedByUser *User   `gorm:"foreignKey:BannedBy"`
	ExpiresAt *time.Time
	CreatedAt time.Time  `gorm:"autoCreateTime"`
}

func (ChatBan) TableName() string {
	return "chat_bans"
}
