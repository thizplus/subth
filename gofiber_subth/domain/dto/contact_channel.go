package dto

import (
	"time"

	"github.com/google/uuid"
)

// === Requests ===

type CreateContactChannelRequest struct {
	Platform    string `json:"platform" validate:"required,oneof=telegram line facebook twitter instagram youtube tiktok email website"`
	Title       string `json:"title" validate:"required,min=1,max=255"`
	Description string `json:"description" validate:"max=1000"`
	URL         string `json:"url" validate:"required,url,max=500"`
	IsActive    *bool  `json:"isActive"` // default true
}

type UpdateContactChannelRequest struct {
	Platform    *string `json:"platform" validate:"omitempty,oneof=telegram line facebook twitter instagram youtube tiktok email website"`
	Title       *string `json:"title" validate:"omitempty,min=1,max=255"`
	Description *string `json:"description" validate:"omitempty,max=1000"`
	URL         *string `json:"url" validate:"omitempty,url,max=500"`
	IsActive    *bool   `json:"isActive"`
}

type ReorderContactChannelsRequest struct {
	IDs []uuid.UUID `json:"ids" validate:"required,min=1"`
}

type ContactChannelListRequest struct {
	IncludeInactive bool `query:"includeInactive"` // For admin: show inactive channels
}

// === Responses ===

type ContactChannelResponse struct {
	ID          uuid.UUID `json:"id"`
	Platform    string    `json:"platform"`
	Title       string    `json:"title"`
	Description string    `json:"description,omitempty"`
	URL         string    `json:"url"`
	SortOrder   int       `json:"sortOrder"`
	IsActive    bool      `json:"isActive"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
