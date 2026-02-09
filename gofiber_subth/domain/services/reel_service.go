package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
)

type ReelService interface {
	// CRUD
	Create(ctx context.Context, req *dto.CreateReelRequest) (*models.Reel, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Reel, error)
	Update(ctx context.Context, id uuid.UUID, req *dto.UpdateReelRequest) (*models.Reel, error)
	Delete(ctx context.Context, id uuid.UUID) error

	// List
	List(ctx context.Context, page int, limit int, activeOnly bool) ([]dto.ReelResponse, int64, error)

	// Sync from suekk - download files and upload to R2
	SyncFromSuekk(ctx context.Context, req *dto.SyncReelRequest) (*models.Reel, error)
}
