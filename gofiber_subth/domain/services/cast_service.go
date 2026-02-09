package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type CastService interface {
	// CRUD
	CreateCast(ctx context.Context, req *dto.CreateCastRequest) (*dto.CastDetailResponse, error)
	GetCast(ctx context.Context, id uuid.UUID, lang string) (*dto.CastDetailResponse, error)
	GetCastBySlug(ctx context.Context, slug string, lang string) (*dto.CastDetailResponse, error)
	UpdateCast(ctx context.Context, id uuid.UUID, req *dto.UpdateCastRequest) (*dto.CastDetailResponse, error)
	DeleteCast(ctx context.Context, id uuid.UUID) error

	// List
	ListCasts(ctx context.Context, req *dto.CastListRequest) ([]dto.CastResponse, int64, error)

	// Search
	SearchCasts(ctx context.Context, query string, lang string, limit int) ([]dto.CastResponse, error)

	// Top casts
	GetTopCasts(ctx context.Context, limit int, lang string) ([]dto.CastResponse, error)
}
