package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type TagRepository interface {
	// Basic CRUD
	Create(ctx context.Context, tag *models.Tag) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Tag, error)
	GetBySlug(ctx context.Context, slug string) (*models.Tag, error)
	GetByName(ctx context.Context, name string) (*models.Tag, error)
	Update(ctx context.Context, tag *models.Tag) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List
	List(ctx context.Context, params TagListParams) ([]models.Tag, int64, error)

	// Search
	Search(ctx context.Context, query string, lang string, limit int) ([]models.Tag, error)

	// Count
	IncrementVideoCount(ctx context.Context, id uuid.UUID) error
	DecrementVideoCount(ctx context.Context, id uuid.UUID) error

	// Bulk
	GetOrCreateByName(ctx context.Context, name string) (*models.Tag, error)

	// Translations
	CreateTranslation(ctx context.Context, trans *models.TagTranslation) error
	GetTranslations(ctx context.Context, tagID uuid.UUID) ([]models.TagTranslation, error)
	GetTranslation(ctx context.Context, tagID uuid.UUID, lang string) (*models.TagTranslation, error)
	DeleteTranslationsByTagID(ctx context.Context, tagID uuid.UUID) error

	// Bulk lookup
	GetNamesByIDs(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]string, error)
}

type TagListParams struct {
	Limit  int
	Offset int
	Lang   string
	Search string
	SortBy string
	Order  string
	IDs    []string // Batch fetch by IDs
}

// AutoTagLabel Repository
type AutoTagLabelRepository interface {
	GetAll(ctx context.Context) ([]models.AutoTagLabel, error)
	GetByKey(ctx context.Context, key string) (*models.AutoTagLabel, error)
	GetByKeys(ctx context.Context, keys []string) ([]models.AutoTagLabel, error)
	GetByCategory(ctx context.Context, category string) ([]models.AutoTagLabel, error)
}
