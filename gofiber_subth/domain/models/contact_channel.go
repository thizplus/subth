package models

import (
	"time"

	"github.com/google/uuid"
)

type ContactChannel struct {
	ID          uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Platform    string    `gorm:"size:50;not null;index"`           // telegram, line, facebook, etc.
	Title       string    `gorm:"size:255;not null"`                // ชื่อปุ่ม เช่น "ติดต่อเรา"
	Description string    `gorm:"type:text"`                        // คำอธิบาย
	URL         string    `gorm:"size:500;not null"`                // Link ไปยังช่องทาง
	SortOrder   int       `gorm:"default:0;index"`                  // ลำดับการแสดง
	IsActive    bool      `gorm:"default:true;index"`               // เปิด/ปิด
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}

func (ContactChannel) TableName() string {
	return "contact_channels"
}
