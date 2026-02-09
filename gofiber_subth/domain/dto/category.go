package dto

import "github.com/google/uuid"

// === Requests ===

type CreateCategoryRequest struct {
	Name         string            `json:"name" validate:"required,min=1,max=100"`
	Translations map[string]string `json:"translations"` // {"th": "...", "ja": "..."}
}

type UpdateCategoryRequest struct {
	Name         *string           `json:"name" validate:"omitempty,min=1,max=100"`
	Translations map[string]string `json:"translations"` // จะแทนที่ทั้งหมด
}

// === Responses ===

type CategoryResponse struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	Slug       string    `json:"slug"`
	VideoCount int       `json:"videoCount"`
}

type CategoryDetailResponse struct {
	ID           uuid.UUID         `json:"id"`
	Name         string            `json:"name"`
	Slug         string            `json:"slug"`
	VideoCount   int               `json:"videoCount"`
	Translations map[string]string `json:"translations,omitempty"`
}
