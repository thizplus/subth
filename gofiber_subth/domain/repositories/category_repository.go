package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type CategoryRepository interface {
	Create(ctx context.Context, category *models.Category) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error)
	GetBySlug(ctx context.Context, slug string) (*models.Category, error)
	GetByName(ctx context.Context, name string) (*models.Category, error)
	GetOrCreate(ctx context.Context, name string) (*models.Category, error)
	List(ctx context.Context) ([]*models.Category, error)
	Update(ctx context.Context, category *models.Category) error
	Delete(ctx context.Context, id uuid.UUID) error
	UpdateVideoCount(ctx context.Context, id uuid.UUID) error
	IncrementVideoCount(ctx context.Context, id uuid.UUID) error
	DecrementVideoCount(ctx context.Context, id uuid.UUID) error
	RefreshAllVideoCounts(ctx context.Context) error

	// Translations
	CreateTranslation(ctx context.Context, trans *models.CategoryTranslation) error
	DeleteTranslationsByCategoryID(ctx context.Context, categoryID uuid.UUID) error
}
