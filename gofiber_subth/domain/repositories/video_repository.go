package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type VideoRepository interface {
	// Basic CRUD
	Create(ctx context.Context, video *models.Video) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Video, error)
	Update(ctx context.Context, video *models.Video) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List with filters
	List(ctx context.Context, params VideoListParams) ([]models.Video, int64, error)

	// Relations
	GetWithRelations(ctx context.Context, id uuid.UUID) (*models.Video, error)

	// Translations
	CreateTranslation(ctx context.Context, trans *models.VideoTranslation) error
	GetTranslations(ctx context.Context, videoID uuid.UUID) ([]models.VideoTranslation, error)
	GetTranslation(ctx context.Context, videoID uuid.UUID, lang string) (*models.VideoTranslation, error)
	UpdateTranslation(ctx context.Context, trans *models.VideoTranslation) error
	DeleteTranslations(ctx context.Context, videoID uuid.UUID) error

	// Random
	GetRandom(ctx context.Context, limit int) ([]models.Video, error)

	// Search
	SearchByTitle(ctx context.Context, query string, lang string, limit int, offset int) ([]models.Video, int64, error)

	// By relations
	GetByMakerID(ctx context.Context, makerID uuid.UUID, limit int, offset int) ([]models.Video, int64, error)
	GetByCastID(ctx context.Context, castID uuid.UUID, limit int, offset int) ([]models.Video, int64, error)
	GetByTagID(ctx context.Context, tagID uuid.UUID, limit int, offset int) ([]models.Video, int64, error)
	GetByAutoTags(ctx context.Context, tags []string, limit int, offset int) ([]models.Video, int64, error)

	// Many-to-many associations
	AddCasts(ctx context.Context, videoID uuid.UUID, casts []models.Cast) error
	AddTags(ctx context.Context, videoID uuid.UUID, tags []models.Tag) error
	AddCategories(ctx context.Context, videoID uuid.UUID, categories []models.Category) error
	ReplaceCategories(ctx context.Context, videoID uuid.UUID, categories []models.Category) error

	// Reel queries (for public feed/reels pages)
	GetWithReels(ctx context.Context, limit int, offset int) ([]models.Video, int64, error)
}

type VideoListParams struct {
	Limit    int
	Offset   int
	Lang     string
	Search   string
	MakerID  *uuid.UUID
	CastID   *uuid.UUID
	TagID    *uuid.UUID
	AutoTags []string
	Category string
	SortBy   string
	Order    string
}
