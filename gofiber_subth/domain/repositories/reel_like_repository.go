package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ReelLikeRepository interface {
	// Like/Unlike
	Create(ctx context.Context, like *models.ReelLike) error
	Delete(ctx context.Context, userID, reelID uuid.UUID) error

	// Check status
	Exists(ctx context.Context, userID, reelID uuid.UUID) (bool, error)
	GetByUserAndReel(ctx context.Context, userID, reelID uuid.UUID) (*models.ReelLike, error)

	// Count
	CountByReel(ctx context.Context, reelID uuid.UUID) (int64, error)

	// List user's likes
	ListByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.ReelLike, int64, error)

	// Check multiple reels at once (for feed)
	CheckLikedByUser(ctx context.Context, userID uuid.UUID, reelIDs []uuid.UUID) (map[uuid.UUID]bool, error)
}
