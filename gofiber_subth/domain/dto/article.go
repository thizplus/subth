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
	Language        string `json:"language"` // "th" or "en" (default: th)
	Type            string `json:"type"`     // review, ranking, best-of, guide, news (default: review)
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
	Language       string  `json:"language"`
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
	Language        string                 `json:"language"`
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
	Language        string                 `json:"language"`
	Type            string                 `json:"type"`
	Title           string                 `json:"title"`
	MetaTitle       string                 `json:"metaTitle"`
	MetaDescription string                 `json:"metaDescription"`
	Content         map[string]interface{} `json:"content"`
	VideoCode       string                 `json:"videoCode"`
	VideoID         string                 `json:"videoId"`  // V3: needed for CTA links
	PublishedAt     string                 `json:"publishedAt"`
}

// Public Article List (for SEO pages)
type PublicArticleListParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Type   string `query:"type"` // filter by article type (review, ranking, etc.)
	Lang   string `query:"lang"`
	Search string `query:"search"`
	Sort   string `query:"sort"`  // published_at, updated_at (default: published_at)
	Order  string `query:"order"` // asc, desc (default: desc)
}

func (p *PublicArticleListParams) SetDefaults() {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 || p.Limit > 100 {
		p.Limit = 24
	}
	if p.Sort == "" {
		p.Sort = "published_at"
	}
	if p.Order == "" {
		p.Order = "desc"
	}
}

type PublicArticleSummary struct {
	Slug            string   `json:"slug"`
	Language        string   `json:"language"`
	Type            string   `json:"type"`
	Title           string   `json:"title"`
	MetaDescription string   `json:"metaDescription"`
	ThumbnailUrl    string   `json:"thumbnailUrl"`
	VideoCode       string   `json:"videoCode"`
	PublishedAt     string   `json:"publishedAt"`
	QualityScore    int      `json:"qualityScore,omitempty"`
	CastNames       []string `json:"castNames,omitempty"`
	MakerName       string   `json:"makerName,omitempty"`
	Tags            []string `json:"tags,omitempty"`
}

// ========================================
// V3 Content Types (Intent-Driven Structure)
// ========================================

// ArticleContentV3 - V3 article content structure from SEO worker
type ArticleContentV3 struct {
	// Chunk 1: Quick Answer (Featured Snippet target)
	QuickAnswer string `json:"quickAnswer"` // 2-3 ประโยค declarative
	MainHook    string `json:"mainHook"`    // 1 ประโยค hook
	Verdict     string `json:"verdict"`     // 1 ประโยค soft recommendation

	// Chunk 2: Facts
	Facts ArticleFactsV3 `json:"facts"`

	// Chunk 3: Story
	Synopsis            string   `json:"synopsis"`            // 150-250 คำ (แบ่ง [PARA])
	StoryFlow           string   `json:"storyFlow"`           // 80-100 คำ timeline
	KeyScenes           []string `json:"keyScenes"`           // 3-5 ฉาก
	FeaturedScene       string   `json:"featuredScene"`       // 120-150 คำ (ฉากเด่น)
	Tone                string   `json:"tone"`                // 2-3 คำ
	RelationshipDynamic string   `json:"relationshipDynamic"` // 50-80 คำ

	// Chunk 4: Review
	ReviewSummary  string   `json:"reviewSummary"`  // 200-300 คำ (แบ่ง [PARA])
	Strengths      []string `json:"strengths"`      // 3-5 จุดเด่น
	Weaknesses     []string `json:"weaknesses"`     // 2-3 จุดอ่อน
	WhoShouldWatch string   `json:"whoShouldWatch"` // 50-80 คำ
	VerdictReason  string   `json:"verdictReason"`  // 30-50 คำ

	// Chunk 5: FAQ
	FAQItems []FAQItemV3 `json:"faqItems"` // 5 items

	// Chunk 6: SEO
	TitleAggressive string   `json:"titleAggressive"` // Meta title
	TitleBalanced   string   `json:"titleBalanced"`   // H1
	MetaDescription string   `json:"metaDescription"` // 150-160 chars
	Slug            string   `json:"slug"`
	Keywords        []string `json:"keywords"`      // 5-8 SEO keywords
	SearchIntents   []string `json:"searchIntents"` // 4-5 phrases for internal linking
	Rating          float64  `json:"rating"`        // 1-5 scale

	// Metadata (enriched by API)
	ThumbnailUrl        string              `json:"thumbnailUrl"`
	CastProfiles        []CastProfileV3     `json:"castProfiles,omitempty"`
	MakerInfo           *MakerInfoV3        `json:"makerInfo,omitempty"`
	TagDescriptions     []TagDescriptionV3  `json:"tagDescriptions,omitempty"`
	GalleryImages       []GalleryImageV3    `json:"galleryImages,omitempty"`
	MemberGalleryImages []GalleryImageV3    `json:"memberGalleryImages,omitempty"`
	MemberGalleryCount  int                 `json:"memberGalleryCount,omitempty"`

	// Timestamps
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// ArticleFactsV3 - Structured facts for Schema.org
type ArticleFactsV3 struct {
	Code              string   `json:"code"`
	Studio            string   `json:"studio"`
	Cast              []string `json:"cast"`
	Duration          string   `json:"duration"`          // "120 นาที"
	DurationMinutes   int      `json:"durationMinutes"`   // 120
	Genre             []string `json:"genre"`
	ReleaseYear       string   `json:"releaseYear"`
	SubtitleAvailable bool     `json:"subtitleAvailable"`
}

// FAQItemV3 - FAQ item
type FAQItemV3 struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

// CastProfileV3 - Cast profile with link
type CastProfileV3 struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	NameTH     string `json:"nameTH,omitempty"`
	Bio        string `json:"bio,omitempty"`
	ImageUrl   string `json:"imageUrl,omitempty"`
	ProfileUrl string `json:"profileUrl"`
}

// MakerInfoV3 - Maker/Studio info
type MakerInfoV3 struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	ProfileUrl  string `json:"profileUrl"`
}

// TagDescriptionV3 - Tag with description
type TagDescriptionV3 struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Url         string `json:"url"`
}

// GalleryImageV3 - Gallery image
type GalleryImageV3 struct {
	Url    string `json:"url"`
	Alt    string `json:"alt"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

// ========================================
// V3 Public Response (for nextjs_subth)
// ========================================

// PublicArticleResponseV3 - V3 article response with typed content
type PublicArticleResponseV3 struct {
	Slug        string            `json:"slug"`
	VideoCode   string            `json:"videoCode"`
	VideoID     string            `json:"videoId"`
	PublishedAt string            `json:"publishedAt"`
	Content     ArticleContentV3  `json:"content"`
}
