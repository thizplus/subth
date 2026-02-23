package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type SEOArticleRepository interface {
	// Basic CRUD
	Create(ctx context.Context, article *models.SEOArticle) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.SEOArticle, error)
	GetBySlug(ctx context.Context, slug string) (*models.SEOArticle, error)
	GetByVideoID(ctx context.Context, videoID uuid.UUID) (*models.SEOArticle, error)
	Update(ctx context.Context, article *models.SEOArticle) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List with filters
	List(ctx context.Context, params SEOArticleListParams) ([]models.SEOArticle, int64, error)

	// Stats
	GetStats(ctx context.Context) (*SEOArticleStats, error)

	// Status updates
	UpdateStatus(ctx context.Context, id uuid.UUID, status models.SEOArticleStatus) error
	BulkSchedule(ctx context.Context, ids []uuid.UUID, scheduledAt []interface{}) error

	// Scheduler queries
	GetScheduledToPublish(ctx context.Context) ([]models.SEOArticle, error)

	// Indexing queries
	GetPendingIndexing(ctx context.Context, limit int) ([]models.SEOArticle, error)
	UpdateIndexingStatus(ctx context.Context, id uuid.UUID, status models.IndexingStatus) error

	// Public
	GetPublishedBySlug(ctx context.Context, slug string) (*models.SEOArticle, error)
}

type SEOArticleListParams struct {
	Limit          int
	Offset         int
	Status         string
	IndexingStatus string
	Search         string
	SortBy         string
	Order          string
}

type SEOArticleStats struct {
	TotalArticles  int64
	DraftCount     int64
	ScheduledCount int64
	PublishedCount int64
	IndexedCount   int64
	PendingIndex   int64
	FailedIndex    int64
}
