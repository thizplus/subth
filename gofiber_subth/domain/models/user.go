package models

import (
	"time"
	"github.com/google/uuid"
)

type User struct {
	ID          uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	GoogleID    *string   `gorm:"size:255;index"` // nullable for non-Google users
	Email       string    `gorm:"uniqueIndex;not null"`
	Username    string    `gorm:"uniqueIndex;not null"`
	DisplayName string    `gorm:"size:100"` // ชื่อแสดงสุ่มจากระบบ เช่น "นักดูหนังลึกลับ"
	Password    string    // nullable for Google users
	FirstName   string
	LastName    string
	Avatar      string    // URL จาก Google หรือ custom
	AvatarSeed  string    `gorm:"size:50"` // seed สำหรับ DiceBear avatar
	Role        string    `gorm:"default:'user'"`
	IsActive    bool      `gorm:"default:true"`
	CreatedAt   time.Time
	UpdatedAt   time.Time

	// Relations
	Stats *UserStats `gorm:"foreignKey:UserID"`
}

// GetAvatarURL returns the DiceBear avatar URL
func (u *User) GetAvatarURL() string {
	seed := u.AvatarSeed
	if seed == "" {
		seed = u.ID.String()
	}
	return "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=" + seed
}

// IsGoogleUser checks if the user logged in via Google
func (u *User) IsGoogleUser() bool {
	return u.GoogleID != nil && *u.GoogleID != ""
}

func (User) TableName() string {
	return "users"
}