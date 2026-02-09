package models

import (
	"time"

	"github.com/google/uuid"
)

// XPSource แหล่งที่มาของ XP
type XPSource string

const (
	XPSourceRegistration XPSource = "registration" // สมัครสมาชิก
	XPSourceView         XPSource = "view"         // ดู video
	XPSourceLike         XPSource = "like"         // กด like
	XPSourceComment      XPSource = "comment"      // เขียน comment
)

// XPReferenceType ประเภทของ reference
type XPReferenceType string

const (
	XPRefTypeReel    XPReferenceType = "reel"
	XPRefTypeComment XPReferenceType = "comment"
)

// XP amounts
const (
	XPAmountRegistration = 100
	XPAmountView         = 5
	XPAmountLike         = 2
	XPAmountComment      = 10
	MaxDailyComments     = 10 // จำกัด comment xp 10 ครั้งต่อวัน
)

// XPTransaction บันทึกประวัติการได้รับ XP
type XPTransaction struct {
	ID            uuid.UUID        `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID        uuid.UUID        `gorm:"not null;index;type:uuid"`
	User          *User            `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	XPAmount      int              `gorm:"not null"`
	Source        XPSource         `gorm:"size:50;not null;index"`
	ReferenceID   *uuid.UUID       `gorm:"type:uuid;index"` // reel_id, comment_id, etc.
	ReferenceType *XPReferenceType `gorm:"size:50"`
	CreatedAt     time.Time        `gorm:"autoCreateTime"`
}

func (XPTransaction) TableName() string {
	return "xp_transactions"
}
