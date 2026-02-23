package dto

import "time"

// ========================================
// Request DTOs
// ========================================

type SEOArticleListParams struct {
	Page           int    `query:"page"`
	Limit          int    `query:"limit"`
	Status         string `query:"status"`
	IndexingStatus string `query:"indexing_status"`
	Search         string `query:"search"`
	SortBy         string `query:"sort_by"`
	Order          string `query:"order"`
}

func (p *SEOArticleListParams) SetDefaults() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 || p.Limit > 100 {
		p.Limit = 20
	}
	if p.SortBy == "" {
		p.SortBy = "created_at"
	}
	if p.Order == "" {
		p.Order = "desc"
	}
}

type UpdateSEOArticleStatusRequest struct {
	Status      string     `json:"status" validate:"required,oneof=draft scheduled published"`
	ScheduledAt *time.Time `json:"scheduledAt,omitempty"`
}

type BulkScheduleRequest struct {
	ArticleIDs  []string  `json:"articleIds" validate:"required,min=1"`
	ScheduledAt time.Time `json:"scheduledAt" validate:"required"`
	Interval    int       `json:"interval"` // minutes between each article
}

// IngestArticleRequest - Worker ส่ง JSON มาเก็บ
type IngestArticleRequest struct {
	VideoID         string `json:"video_id" validate:"required,uuid"`
	Title           string `json:"title" validate:"required"`
	MetaTitle       string `json:"metaTitle" validate:"required"`
	MetaDescription string `json:"metaDescription" validate:"required"`
	Slug            string `json:"slug" validate:"required"`
	QualityScore    int    `json:"qualityScore"`
	ReadingTime     int    `json:"readingTime"`
	// Content จะถูกเก็บเป็น full JSON
}

// ========================================
// Response DTOs
// ========================================

type SEOArticleListItemResponse struct {
	ID             string  `json:"id"`
	VideoID        string  `json:"videoId"`
	VideoCode      string  `json:"videoCode"`
	VideoThumbnail string  `json:"videoThumbnail,omitempty"`
	Slug           string  `json:"slug"`
	Title          string  `json:"title"`
	Status         string  `json:"status"`
	IndexingStatus string  `json:"indexingStatus"`
	QualityScore   int     `json:"qualityScore"`
	ReadingTime    int     `json:"readingTime"`
	ScheduledAt    *string `json:"scheduledAt,omitempty"`
	PublishedAt    *string `json:"publishedAt,omitempty"`
	CreatedAt      string  `json:"createdAt"`
}

type SEOArticleDetailResponse struct {
	ID              string                 `json:"id"`
	VideoID         string                 `json:"videoId"`
	VideoCode       string                 `json:"videoCode"`
	Slug            string                 `json:"slug"`
	Title           string                 `json:"title"`
	MetaTitle       string                 `json:"metaTitle"`
	MetaDescription string                 `json:"metaDescription"`
	Content         map[string]interface{} `json:"content"`
	Status          string                 `json:"status"`
	IndexingStatus  string                 `json:"indexingStatus"`
	QualityScore    int                    `json:"qualityScore"`
	ReadingTime     int                    `json:"readingTime"`
	ScheduledAt     *string                `json:"scheduledAt,omitempty"`
	PublishedAt     *string                `json:"publishedAt,omitempty"`
	IndexedAt       *string                `json:"indexedAt,omitempty"`
	CreatedAt       string                 `json:"createdAt"`
	UpdatedAt       string                 `json:"updatedAt"`
}

type SEOArticleStatsResponse struct {
	TotalArticles  int `json:"totalArticles"`
	DraftCount     int `json:"draftCount"`
	ScheduledCount int `json:"scheduledCount"`
	PublishedCount int `json:"publishedCount"`
	IndexedCount   int `json:"indexedCount"`
	PendingIndex   int `json:"pendingIndex"`
	FailedIndex    int `json:"failedIndex"`
}

// ========================================
// Public API Response (for nextjs_subth)
// ========================================

type PublicArticleResponse struct {
	Slug            string                 `json:"slug"`
	Title           string                 `json:"title"`
	MetaTitle       string                 `json:"metaTitle"`
	MetaDescription string                 `json:"metaDescription"`
	Content         map[string]interface{} `json:"content"`
	VideoCode       string                 `json:"videoCode"`
	PublishedAt     string                 `json:"publishedAt"`
}
