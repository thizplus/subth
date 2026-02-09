package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type MakerService interface {
	// CRUD
	CreateMaker(ctx context.Context, req *dto.CreateMakerRequest) (*dto.MakerDetailResponse, error)
	GetMaker(ctx context.Context, id uuid.UUID) (*dto.MakerDetailResponse, error)
	GetMakerBySlug(ctx context.Context, slug string) (*dto.MakerDetailResponse, error)
	UpdateMaker(ctx context.Context, id uuid.UUID, req *dto.UpdateMakerRequest) (*dto.MakerDetailResponse, error)
	DeleteMaker(ctx context.Context, id uuid.UUID) error

	// List
	ListMakers(ctx context.Context, req *dto.MakerListRequest) ([]dto.MakerResponse, int64, error)

	// Search
	SearchMakers(ctx context.Context, query string, limit int) ([]dto.MakerResponse, error)

	// Top makers
	GetTopMakers(ctx context.Context, limit int) ([]dto.MakerResponse, error)
}
