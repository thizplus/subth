package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type ArticleService interface {
	// Ingest from worker
	IngestArticle(ctx context.Context, req *dto.IngestArticleRequest, content []byte) (*dto.ArticleDetailResponse, error)

	// CRUD
	GetArticle(ctx context.Context, id uuid.UUID) (*dto.ArticleDetailResponse, error)
	GetArticleBySlug(ctx context.Context, slug string) (*dto.ArticleDetailResponse, error)
	DeleteArticle(ctx context.Context, id uuid.UUID) error

	// List
	ListArticles(ctx context.Context, params *dto.ArticleListParams) ([]dto.ArticleListItemResponse, int64, error)

	// Stats
	GetStats(ctx context.Context) (*dto.ArticleStatsResponse, error)

	// Status management
	UpdateStatus(ctx context.Context, id uuid.UUID, req *dto.UpdateArticleStatusRequest) error
	BulkSchedule(ctx context.Context, req *dto.BulkScheduleRequest) error

	// Scheduler
	PublishScheduledArticles(ctx context.Context) (int, error)

	// Public API
	GetPublishedArticle(ctx context.Context, slug string) (*dto.PublicArticleResponse, error)
	GetPublishedArticleByType(ctx context.Context, articleType string, slug string) (*dto.PublicArticleResponse, error)
	ListPublishedArticles(ctx context.Context, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error)
	ListArticlesByCast(ctx context.Context, castSlug string, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error)
	ListArticlesByTag(ctx context.Context, tagSlug string, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error)
	ListArticlesByMaker(ctx context.Context, makerSlug string, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error)

	// Cache management
	ClearArticleCache(ctx context.Context, articleType string, slug string) error
}
