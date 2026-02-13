package dto

import (
	"time"

	"github.com/google/uuid"
)

// === Requests ===

type VideoListRequest struct {
	Page     int    `query:"page" validate:"min=1"`
	Limit    int    `query:"limit" validate:"min=1,max=100"`
	Lang     string `query:"lang" validate:"omitempty,oneof=en th ja"`
	Search   string `query:"search"`
	MakerID  string `query:"maker_id"`
	CastID   string `query:"cast_id"`
	TagID    string `query:"tag_id"`
	AutoTags string `query:"auto_tags"` // comma separated: glasses,short_hair
	Category string `query:"category"`
	SortBy   string `query:"sort_by" validate:"omitempty,oneof=date created_at"`
	Order    string `query:"order" validate:"omitempty,oneof=asc desc"`
}

type CreateVideoRequest struct {
	Thumbnail   string            `json:"thumbnail"`
	EmbedURL    string            `json:"embed_url"`
	Categories  []string          `json:"categories"` // Multi-category: ["onlyfans", "homemade"]
	ReleaseDate string            `json:"release_date"`
	MakerName   string            `json:"maker"`
	CastNames   []string          `json:"cast"`
	TagNames    []string          `json:"tags"`
	Titles      map[string]string `json:"titles"` // {"en": "...", "th": "..."}
}

type UpdateVideoRequest struct {
	Thumbnail   *string           `json:"thumbnail"`
	EmbedURL    *string           `json:"embed_url"`
	Categories  []string          `json:"categories"` // Multi-category: ["onlyfans", "homemade"]
	ReleaseDate *string           `json:"release_date"`
	MakerName   *string           `json:"maker"`
	CastNames   []string          `json:"cast"`
	TagNames    []string          `json:"tags"`
	Titles      map[string]string `json:"titles"`
}

// === Batch Requests ===

type BatchCreateVideoRequest struct {
	Videos []CreateVideoRequest `json:"videos" validate:"required,min=1,max=100,dive"`
}

type BatchCreateVideoItemResult struct {
	Index   int             `json:"index"`
	Success bool            `json:"success"`
	VideoID *uuid.UUID      `json:"video_id,omitempty"`
	Error   string          `json:"error,omitempty"`
}

type BatchCreateVideoResponse struct {
	Total     int                          `json:"total"`
	Succeeded int                          `json:"succeeded"`
	Failed    int                          `json:"failed"`
	Results   []BatchCreateVideoItemResult `json:"results"`
}

// === Responses ===

type VideoResponse struct {
	ID           uuid.UUID           `json:"id"`
	Title        string              `json:"title"`
	Translations map[string]string   `json:"translations,omitempty"`
	Thumbnail    string              `json:"thumbnail,omitempty"`
	EmbedURL     string              `json:"embedUrl,omitempty"`
	Categories   []CategoryResponse  `json:"categories,omitempty"` // Multi-category
	ReleaseDate  string              `json:"releaseDate,omitempty"` // Format: YYYY-MM-DD
	Maker        *MakerResponse      `json:"maker,omitempty"`
	Casts        []CastResponse      `json:"casts,omitempty"`
	Tags         []TagResponse       `json:"tags,omitempty"`
	AutoTags     []AutoTagResponse   `json:"autoTags,omitempty"`
	CreatedAt    time.Time           `json:"createdAt"`
	UpdatedAt    time.Time           `json:"updatedAt"`
}

type VideoListItemResponse struct {
	ID          uuid.UUID              `json:"id"`
	Title       string                 `json:"title"`
	TitleTh     string                 `json:"titleTh,omitempty"`
	Thumbnail   string                 `json:"thumbnail,omitempty"`
	Categories  []string               `json:"categories,omitempty"` // Category slugs
	ReleaseDate string                 `json:"releaseDate,omitempty"` // Format: YYYY-MM-DD
	MakerName   string                 `json:"maker,omitempty"`
	Casts       []CastListItemResponse `json:"casts,omitempty"`
}

type CastListItemResponse struct {
	Name string `json:"name"`
}

type AutoTagResponse struct {
	Key      string `json:"key"`
	Name     string `json:"name"`
	Category string `json:"category"`
}

// === Videos By Categories (Homepage) ===

type VideosByCategoriesRequest struct {
	LimitPerCategory int    `query:"limit" validate:"min=1,max=20"`
	CategoryCount    int    `query:"categories" validate:"omitempty,min=0,max=100"`
	Lang             string `query:"lang" validate:"omitempty,oneof=en th ja"`
}

type CategoryWithVideosResponse struct {
	Category CategoryResponse        `json:"category"`
	Videos   []VideoListItemResponse `json:"videos"`
}

// === Search ===

type SemanticSearchRequest struct {
	Query string `json:"query" validate:"required"`
	Lang  string `json:"lang" validate:"omitempty,oneof=en th ja"`
	Limit int    `json:"limit" validate:"min=1,max=100"`
}

type ImageSearchRequest struct {
	ImageURL string `json:"image_url" validate:"omitempty,url"`
	Limit    int    `json:"limit" validate:"min=1,max=100"`
}
