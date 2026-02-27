package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ArticleType - ประเภทบทความ
type ArticleType string

const (
	ArticleTypeReview  ArticleType = "review"  // Review article (AI-generated)
	ArticleTypeRanking ArticleType = "ranking" // Top 10 / Ranking lists
	ArticleTypeBestOf  ArticleType = "best-of" // Best of [Cast/Maker]
	ArticleTypeGuide   ArticleType = "guide"   // Ultimate Guide to [Tag]
	ArticleTypeNews    ArticleType = "news"    // News article
)

// ValidArticleTypes - ประเภทที่ใช้ใน URL path
var ValidArticleTypes = map[string]bool{
	"review":  true,
	"ranking": true,
	"best-of": true,
	"guide":   true,
	"news":    true,
}

// IsValidArticleType - ตรวจสอบว่าเป็น type ที่ถูกต้องหรือไม่
func IsValidArticleType(t string) bool {
	return ValidArticleTypes[t]
}

// ArticleStatus - สถานะบทความ
type ArticleStatus string

const (
	ArticleStatusDraft     ArticleStatus = "draft"
	ArticleStatusScheduled ArticleStatus = "scheduled"
	ArticleStatusPublished ArticleStatus = "published"
	ArticleStatusArchived  ArticleStatus = "archived"
)

// IndexingStatus - สถานะการ index กับ Google
type IndexingStatus string

const (
	IndexingPending   IndexingStatus = "pending"
	IndexingSubmitted IndexingStatus = "submitted"
	IndexingIndexed   IndexingStatus = "indexed"
	IndexingFailed    IndexingStatus = "failed"
)

// Article - บทความ
type Article struct {
	ID      uuid.UUID `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	VideoID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex"` // 1 video = 1 article

	// Article Type
	Type ArticleType `gorm:"size:20;default:'review';index"`

	// Core SEO (indexed for search)
	Slug            string `gorm:"size:100;uniqueIndex;not null"`
	Title           string `gorm:"size:200;not null"`
	MetaTitle       string `gorm:"size:100;not null"`
	MetaDescription string `gorm:"size:250;not null"`

	// Full Content (JSONB - flexible structure จาก worker)
	Content json.RawMessage `gorm:"type:jsonb;not null"`

	// Status & Workflow
	Status      ArticleStatus `gorm:"size:20;default:'draft';index"`
	ScheduledAt *time.Time    `gorm:"index"`
	PublishedAt *time.Time

	// SEO Tracking (Google Indexing API)
	IndexedAt      *time.Time
	IndexingStatus IndexingStatus `gorm:"size:20;default:'pending'"`

	// Metadata
	QualityScore int `gorm:"default:0"` // 1-10 จาก AI
	ReadingTime  int `gorm:"default:0"` // minutes

	// Relations
	Video *Video `gorm:"foreignKey:VideoID"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (Article) TableName() string {
	return "articles"
}
