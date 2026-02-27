package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ArticleRepository interface {
	// Basic CRUD
	Create(ctx context.Context, article *models.Article) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Article, error)
	GetBySlug(ctx context.Context, slug string) (*models.Article, error)
	GetByVideoID(ctx context.Context, videoID uuid.UUID) (*models.Article, error)
	Update(ctx context.Context, article *models.Article) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List with filters
	List(ctx context.Context, params ArticleListParams) ([]models.Article, int64, error)

	// Stats
	GetStats(ctx context.Context) (*ArticleStats, error)

	// Status updates
	UpdateStatus(ctx context.Context, id uuid.UUID, status models.ArticleStatus) error
	BulkSchedule(ctx context.Context, ids []uuid.UUID, scheduledAt []interface{}) error

	// Scheduler queries
	GetScheduledToPublish(ctx context.Context) ([]models.Article, error)

	// Indexing queries
	GetPendingIndexing(ctx context.Context, limit int) ([]models.Article, error)
	UpdateIndexingStatus(ctx context.Context, id uuid.UUID, status models.IndexingStatus) error

	// Public
	GetPublishedBySlug(ctx context.Context, slug string) (*models.Article, error)
	GetPublishedByTypeAndSlug(ctx context.Context, articleType string, slug string) (*models.Article, error)

	// Public Listing (for SEO pages)
	ListPublished(ctx context.Context, params PublicArticleListParams) ([]PublishedArticleWithVideo, int64, error)
	ListPublishedByCast(ctx context.Context, castSlug string, params PublicArticleListParams) ([]PublishedArticleWithVideo, int64, error)
	ListPublishedByTag(ctx context.Context, tagSlug string, params PublicArticleListParams) ([]PublishedArticleWithVideo, int64, error)
	ListPublishedByMaker(ctx context.Context, makerSlug string, params PublicArticleListParams) ([]PublishedArticleWithVideo, int64, error)
}

// PublicArticleListParams สำหรับ public API
type PublicArticleListParams struct {
	Limit       int
	Offset      int
	Search      string
	ArticleType string // filter by type (review, ranking, best-of, guide, news)
}

// PublishedArticleWithVideo เก็บ article พร้อม video data
type PublishedArticleWithVideo struct {
	models.Article
	VideoCode      string
	VideoThumbnail string
	MakerName      string
	MakerSlug      string
	CastNames      []string
	CastSlugs      []string
	TagNames       []string
	TagSlugs       []string
}

type ArticleListParams struct {
	Limit          int
	Offset         int
	Type           string
	Status         string
	IndexingStatus string
	Search         string
	SortBy         string
	Order          string
}

type ArticleStats struct {
	TotalArticles  int64
	DraftCount     int64
	ScheduledCount int64
	PublishedCount int64
	IndexedCount   int64
	PendingIndex   int64
	FailedIndex    int64
}
