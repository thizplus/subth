package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Video struct {
	ID          uuid.UUID      `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Thumbnail   string         `gorm:"size:255"` // เก็บแค่ path เช่น /thumbnails/AAA-001.jpg
	SourceURL   string         `gorm:"size:255"` // URL ต้นทาง เช่น https://supjav.com/136849.html
	EmbedURL    string         `gorm:"size:255"` // Embed player URL เช่น https://player.suekk.com/embed/xxx
	ReleaseDate *time.Time     `gorm:"type:date"`
	MakerID     *uuid.UUID     `gorm:"type:uuid"`
	Views       int            `gorm:"default:0"`
	AutoTags    pq.StringArray `gorm:"type:text[]"`

	// Reel fields (from reel worker)
	ReelVideoURL string `gorm:"size:500" json:"reel_video_url"` // cdn.suekk.com/xxx/output.mp4
	ReelThumbURL string `gorm:"size:500" json:"reel_thumb_url"` // cdn.suekk.com/xxx/thumb.jpg
	ReelCoverURL string `gorm:"size:500" json:"reel_cover_url"` // cdn.suekk.com/xxx/cover.jpg
	HasReel      bool   `gorm:"default:false" json:"has_reel"`  // มี reel หรือยัง

	// Relations
	Maker        *Maker             `gorm:"foreignKey:MakerID"`
	Translations []VideoTranslation `gorm:"foreignKey:VideoID"`
	Categories   []Category         `gorm:"many2many:video_categories"` // Multi-category support
	Casts        []Cast             `gorm:"many2many:video_casts"`
	Tags         []Tag              `gorm:"many2many:video_tags"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (Video) TableName() string {
	return "videos"
}
