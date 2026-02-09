package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ReelCommentRepository interface {
	// CRUD
	Create(ctx context.Context, comment *models.ReelComment) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.ReelComment, error)
	Update(ctx context.Context, comment *models.ReelComment) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List by reel (with pagination)
	ListByReel(ctx context.Context, reelID uuid.UUID, limit, offset int) ([]models.ReelComment, int64, error)

	// List replies for a comment
	ListReplies(ctx context.Context, parentID uuid.UUID, limit, offset int) ([]models.ReelComment, int64, error)

	// Count
	CountByReel(ctx context.Context, reelID uuid.UUID) (int64, error)
}
