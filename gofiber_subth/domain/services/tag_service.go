package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type TagService interface {
	// CRUD
	CreateTag(ctx context.Context, req *dto.CreateTagRequest) (*dto.TagDetailResponse, error)
	GetTag(ctx context.Context, id uuid.UUID, lang string) (*dto.TagDetailResponse, error)
	GetTagBySlug(ctx context.Context, slug string, lang string) (*dto.TagDetailResponse, error)
	UpdateTag(ctx context.Context, id uuid.UUID, req *dto.UpdateTagRequest) (*dto.TagDetailResponse, error)
	DeleteTag(ctx context.Context, id uuid.UUID) error

	// List
	ListTags(ctx context.Context, req *dto.TagListRequest) ([]dto.TagResponse, int64, error)

	// Search
	SearchTags(ctx context.Context, query string, lang string, limit int) ([]dto.TagResponse, error)

	// Top tags
	GetTopTags(ctx context.Context, limit int, lang string) ([]dto.TagResponse, error)

	// Auto Tags
	ListAutoTags(ctx context.Context, lang string, category string) ([]dto.AutoTagLabelResponse, error)
	GetAutoTagsByKeys(ctx context.Context, keys []string, lang string) ([]dto.AutoTagResponse, error)
}
