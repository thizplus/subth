package postgres

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type articleRepositoryImpl struct {
	db *gorm.DB
}

func NewArticleRepository(db *gorm.DB) repositories.ArticleRepository {
	return &articleRepositoryImpl{db: db}
}

func (r *articleRepositoryImpl) Create(ctx context.Context, article *models.Article) error {
	return r.db.WithContext(ctx).Create(article).Error
}

func (r *articleRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Article, error) {
	var article models.Article
	err := r.db.WithContext(ctx).First(&article, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *articleRepositoryImpl) GetBySlug(ctx context.Context, slug string) (*models.Article, error) {
	var article models.Article
	err := r.db.WithContext(ctx).First(&article, "slug = ?", slug).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *articleRepositoryImpl) GetByVideoID(ctx context.Context, videoID uuid.UUID) (*models.Article, error) {
	var article models.Article
	err := r.db.WithContext(ctx).First(&article, "video_id = ?", videoID).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *articleRepositoryImpl) Update(ctx context.Context, article *models.Article) error {
	return r.db.WithContext(ctx).Save(article).Error
}

func (r *articleRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Article{}, "id = ?", id).Error
}

func (r *articleRepositoryImpl) List(ctx context.Context, params repositories.ArticleListParams) ([]models.Article, int64, error) {
	var articles []models.Article
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Article{})

	// Filters
	if params.Type != "" {
		query = query.Where("type = ?", params.Type)
	}
	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.IndexingStatus != "" {
		query = query.Where("indexing_status = ?", params.IndexingStatus)
	}
	if params.Search != "" {
		query = query.Where("title ILIKE ? OR slug ILIKE ?", "%"+params.Search+"%", "%"+params.Search+"%")
	}

	query.Count(&total)

	// Sorting
	orderBy := "created_at"
	if params.SortBy != "" {
		orderBy = params.SortBy
	}
	order := "DESC"
	if params.Order != "" {
		order = strings.ToUpper(params.Order)
	}
	query = query.Order(orderBy + " " + order)

	err := query.Offset(params.Offset).Limit(params.Limit).Find(&articles).Error
	return articles, total, err
}

func (r *articleRepositoryImpl) GetStats(ctx context.Context) (*repositories.ArticleStats, error) {
	var stats repositories.ArticleStats

	// Total
	r.db.WithContext(ctx).Model(&models.Article{}).Count(&stats.TotalArticles)

	// By status
	r.db.WithContext(ctx).Model(&models.Article{}).Where("status = ?", models.ArticleStatusDraft).Count(&stats.DraftCount)
	r.db.WithContext(ctx).Model(&models.Article{}).Where("status = ?", models.ArticleStatusScheduled).Count(&stats.ScheduledCount)
	r.db.WithContext(ctx).Model(&models.Article{}).Where("status = ?", models.ArticleStatusPublished).Count(&stats.PublishedCount)

	// By indexing status (only for published)
	r.db.WithContext(ctx).Model(&models.Article{}).
		Where("status = ? AND indexing_status = ?", models.ArticleStatusPublished, models.IndexingIndexed).
		Count(&stats.IndexedCount)
	r.db.WithContext(ctx).Model(&models.Article{}).
		Where("status = ? AND indexing_status = ?", models.ArticleStatusPublished, models.IndexingPending).
		Count(&stats.PendingIndex)
	r.db.WithContext(ctx).Model(&models.Article{}).
		Where("status = ? AND indexing_status = ?", models.ArticleStatusPublished, models.IndexingFailed).
		Count(&stats.FailedIndex)

	return &stats, nil
}

func (r *articleRepositoryImpl) UpdateStatus(ctx context.Context, id uuid.UUID, status models.ArticleStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}

	if status == models.ArticleStatusPublished {
		now := time.Now()
		updates["published_at"] = now
	}

	return r.db.WithContext(ctx).Model(&models.Article{}).Where("id = ?", id).Updates(updates).Error
}

func (r *articleRepositoryImpl) BulkSchedule(ctx context.Context, ids []uuid.UUID, scheduledAt []interface{}) error {
	// Use transaction for bulk update
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for i, id := range ids {
			if err := tx.Model(&models.Article{}).
				Where("id = ?", id).
				Updates(map[string]interface{}{
					"status":       models.ArticleStatusScheduled,
					"scheduled_at": scheduledAt[i],
				}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *articleRepositoryImpl) GetScheduledToPublish(ctx context.Context) ([]models.Article, error) {
	var articles []models.Article
	err := r.db.WithContext(ctx).
		Where("status = ? AND scheduled_at <= ?", models.ArticleStatusScheduled, time.Now()).
		Find(&articles).Error
	return articles, err
}

func (r *articleRepositoryImpl) GetPendingIndexing(ctx context.Context, limit int) ([]models.Article, error) {
	var articles []models.Article
	err := r.db.WithContext(ctx).
		Where("status = ? AND indexing_status = ?", models.ArticleStatusPublished, models.IndexingPending).
		Limit(limit).
		Find(&articles).Error
	return articles, err
}

func (r *articleRepositoryImpl) UpdateIndexingStatus(ctx context.Context, id uuid.UUID, status models.IndexingStatus) error {
	updates := map[string]interface{}{
		"indexing_status": status,
	}

	if status == models.IndexingIndexed {
		now := time.Now()
		updates["indexed_at"] = now
	}

	return r.db.WithContext(ctx).Model(&models.Article{}).Where("id = ?", id).Updates(updates).Error
}

func (r *articleRepositoryImpl) GetPublishedBySlug(ctx context.Context, slug string) (*models.Article, error) {
	var article models.Article
	err := r.db.WithContext(ctx).
		Where("slug = ? AND status = ?", slug, models.ArticleStatusPublished).
		First(&article).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}
