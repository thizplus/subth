package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ReelRepository interface {
	// Basic CRUD
	Create(ctx context.Context, reel *models.Reel) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Reel, error)
	Update(ctx context.Context, reel *models.Reel) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List with pagination
	List(ctx context.Context, limit int, offset int, activeOnly bool) ([]models.Reel, int64, error)

	// Get by video ID
	GetByVideoID(ctx context.Context, videoID uuid.UUID) (*models.Reel, error)

	// List with video relation (for feed/reels with tags)
	ListWithVideo(ctx context.Context, limit int, offset int, activeOnly bool) ([]models.Reel, int64, error)
}
