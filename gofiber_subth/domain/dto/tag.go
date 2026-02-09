package dto

import (
	"time"

	"github.com/google/uuid"
)

// === Requests ===

type TagListRequest struct {
	Page   int    `query:"page" validate:"min=1"`
	Limit  int    `query:"limit" validate:"min=1,max=100"`
	Lang   string `query:"lang" validate:"omitempty,oneof=en th ja"`
	Search string `query:"search"`
	SortBy string `query:"sort_by" validate:"omitempty,oneof=name video_count created_at"`
	Order  string `query:"order" validate:"omitempty,oneof=asc desc"`
}

type CreateTagRequest struct {
	Name         string            `json:"name" validate:"required,min=1,max=255"`
	Translations map[string]string `json:"translations"` // {"th": "...", "ja": "..."}
}

type UpdateTagRequest struct {
	Name         *string           `json:"name" validate:"omitempty,min=1,max=255"`
	Translations map[string]string `json:"translations"` // จะแทนที่ทั้งหมด
}

// === Responses ===

type TagResponse struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"` // แปลตาม lang
	Slug       string    `json:"slug"`
	VideoCount int       `json:"videoCount"`
}

type TagDetailResponse struct {
	ID           uuid.UUID         `json:"id"`
	Name         string            `json:"name"`
	Slug         string            `json:"slug"`
	VideoCount   int               `json:"videoCount"`
	Translations map[string]string `json:"translations,omitempty"`
	CreatedAt    time.Time         `json:"createdAt"`
}

// === Auto Tag ===

type AutoTagLabelResponse struct {
	Key      string `json:"key"`
	Name     string `json:"name"` // แปลตาม lang
	Category string `json:"category"`
}

type AutoTagListRequest struct {
	Lang     string `query:"lang" validate:"omitempty,oneof=en th ja"`
	Category string `query:"category"`
}
