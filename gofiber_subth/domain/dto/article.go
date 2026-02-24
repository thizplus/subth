package dto

import "time"

// ========================================
// Request DTOs
// ========================================

type ArticleListParams struct {
	Page           int    `query:"page"`
	Limit          int    `query:"limit"`
	Type           string `query:"type"`
	Status         string `query:"status"`
	IndexingStatus string `query:"indexing_status"`
	Search         string `query:"search"`
	SortBy         string `query:"sort_by"`
	Order          string `query:"order"`
}

func (p *ArticleListParams) SetDefaults() {
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

type UpdateArticleStatusRequest struct {
	Status      string     `json:"status" validate:"required,oneof=draft scheduled published archived"`
	ScheduledAt *time.Time `json:"scheduledAt,omitempty"`
}

type BulkScheduleRequest struct {
	ArticleIDs  []string  `json:"articleIds" validate:"required,min=1"`
	ScheduledAt time.Time `json:"scheduledAt" validate:"required"`
	Interval    int       `json:"interval"` // minutes between each article
}

// IngestArticleRequest - Worker ส่ง JSON มาเก็บ
type IngestArticleRequest struct {
	VideoID         string `json:"videoId" validate:"required,uuid"`
	Type            string `json:"type"` // seo, news, review (default: seo)
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

type ArticleListItemResponse struct {
	ID             string  `json:"id"`
	VideoID        string  `json:"videoId"`
	VideoCode      string  `json:"videoCode"`
	VideoThumbnail string  `json:"videoThumbnail,omitempty"`
	Type           string  `json:"type"`
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

type ArticleDetailResponse struct {
	ID              string                 `json:"id"`
	VideoID         string                 `json:"videoId"`
	VideoCode       string                 `json:"videoCode"`
	Type            string                 `json:"type"`
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

type ArticleStatsResponse struct {
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

// Public Article List (for SEO pages)
type PublicArticleListParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Lang   string `query:"lang"`
	Search string `query:"search"`
}

func (p *PublicArticleListParams) SetDefaults() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 || p.Limit > 100 {
		p.Limit = 24
	}
}

type PublicArticleSummary struct {
	Slug            string   `json:"slug"`
	Title           string   `json:"title"`
	MetaDescription string   `json:"metaDescription"`
	ThumbnailUrl    string   `json:"thumbnailUrl"`
	VideoCode       string   `json:"videoCode"`
	PublishedAt     string   `json:"publishedAt"`
	CastNames       []string `json:"castNames,omitempty"`
	MakerName       string   `json:"makerName,omitempty"`
	Tags            []string `json:"tags,omitempty"`
}
