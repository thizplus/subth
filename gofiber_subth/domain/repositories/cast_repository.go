package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type CastRepository interface {
	// Basic CRUD
	Create(ctx context.Context, cast *models.Cast) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Cast, error)
	GetBySlug(ctx context.Context, slug string) (*models.Cast, error)
	GetByName(ctx context.Context, name string) (*models.Cast, error)
	Update(ctx context.Context, cast *models.Cast) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List
	List(ctx context.Context, params CastListParams) ([]models.Cast, int64, error)

	// Search
	Search(ctx context.Context, query string, lang string, limit int) ([]models.Cast, error)

	// Count
	IncrementVideoCount(ctx context.Context, id uuid.UUID) error
	DecrementVideoCount(ctx context.Context, id uuid.UUID) error

	// Bulk
	GetOrCreateByName(ctx context.Context, name string) (*models.Cast, error)

	// Translations
	CreateTranslation(ctx context.Context, trans *models.CastTranslation) error
	GetTranslations(ctx context.Context, castID uuid.UUID) ([]models.CastTranslation, error)
	GetTranslation(ctx context.Context, castID uuid.UUID, lang string) (*models.CastTranslation, error)
	DeleteTranslationsByCastID(ctx context.Context, castID uuid.UUID) error

	// Bulk lookup
	GetNamesByIDs(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID]string, error)
}

type CastListParams struct {
	Limit       int
	Offset      int
	Lang        string
	Search      string
	SortBy      string
	Order       string
	IDs         []string // Batch fetch by IDs (comma-separated UUIDs)
	HasArticles bool     // Filter only casts with published articles
}
