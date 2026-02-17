package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ContactChannelRepository interface {
	// CRUD
	Create(ctx context.Context, channel *models.ContactChannel) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.ContactChannel, error)
	Update(ctx context.Context, channel *models.ContactChannel) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List
	List(ctx context.Context, includeInactive bool) ([]*models.ContactChannel, error)

	// Reorder
	Reorder(ctx context.Context, ids []uuid.UUID) error

	// Count
	Count(ctx context.Context) (int64, error)
}
