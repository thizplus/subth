package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type SEOArticleService interface {
	// Ingest from worker
	IngestArticle(ctx context.Context, req *dto.IngestArticleRequest, content []byte) (*dto.SEOArticleDetailResponse, error)

	// CRUD
	GetArticle(ctx context.Context, id uuid.UUID) (*dto.SEOArticleDetailResponse, error)
	GetArticleBySlug(ctx context.Context, slug string) (*dto.SEOArticleDetailResponse, error)
	DeleteArticle(ctx context.Context, id uuid.UUID) error

	// List
	ListArticles(ctx context.Context, params *dto.SEOArticleListParams) ([]dto.SEOArticleListItemResponse, int64, error)

	// Stats
	GetStats(ctx context.Context) (*dto.SEOArticleStatsResponse, error)

	// Status management
	UpdateStatus(ctx context.Context, id uuid.UUID, req *dto.UpdateSEOArticleStatusRequest) error
	BulkSchedule(ctx context.Context, req *dto.BulkScheduleRequest) error

	// Scheduler
	PublishScheduledArticles(ctx context.Context) (int, error)

	// Public API
	GetPublishedArticle(ctx context.Context, slug string) (*dto.PublicArticleResponse, error)
}
