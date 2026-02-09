package dto

import (
	"time"

	"github.com/google/uuid"
)

// === Requests ===

type MakerListRequest struct {
	Page   int    `query:"page" validate:"min=1"`
	Limit  int    `query:"limit" validate:"min=1,max=100"`
	Search string `query:"search"`
	SortBy string `query:"sort_by" validate:"omitempty,oneof=name video_count created_at"`
	Order  string `query:"order" validate:"omitempty,oneof=asc desc"`
}

type CreateMakerRequest struct {
	Name string `json:"name" validate:"required,min=1,max=255"`
}

type UpdateMakerRequest struct {
	Name *string `json:"name" validate:"omitempty,min=1,max=255"`
}

// === Responses ===

type MakerResponse struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	Slug       string    `json:"slug"`
	VideoCount int       `json:"videoCount"`
}

type MakerDetailResponse struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	Slug       string    `json:"slug"`
	VideoCount int       `json:"videoCount"`
	CreatedAt  time.Time `json:"createdAt"`
}
