package models

import (
	"time"

	"github.com/google/uuid"
)

// SiteSetting stores site-wide configuration like GTM ID, analytics settings, etc.
// This is a singleton table - only one row should exist.
type SiteSetting struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	GTMID     string    `gorm:"size:50;column:gtm_id"` // Google Tag Manager ID (GTM-XXXXXX)
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (SiteSetting) TableName() string {
	return "site_settings"
}
