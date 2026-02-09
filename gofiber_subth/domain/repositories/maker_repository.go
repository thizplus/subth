package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type MakerRepository interface {
	// Basic CRUD
	Create(ctx context.Context, maker *models.Maker) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Maker, error)
	GetBySlug(ctx context.Context, slug string) (*models.Maker, error)
	GetByName(ctx context.Context, name string) (*models.Maker, error)
	Update(ctx context.Context, maker *models.Maker) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List
	List(ctx context.Context, params MakerListParams) ([]models.Maker, int64, error)

	// Search
	Search(ctx context.Context, query string, limit int) ([]models.Maker, error)

	// Count
	IncrementVideoCount(ctx context.Context, id uuid.UUID) error
	DecrementVideoCount(ctx context.Context, id uuid.UUID) error

	// Bulk
	GetOrCreateByName(ctx context.Context, name string) (*models.Maker, error)
}

type MakerListParams struct {
	Limit  int
	Offset int
	Search string
	SortBy string
	Order  string
}
