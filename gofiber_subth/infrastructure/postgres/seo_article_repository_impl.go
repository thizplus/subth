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

type seoArticleRepositoryImpl struct {
	db *gorm.DB
}

func NewSEOArticleRepository(db *gorm.DB) repositories.SEOArticleRepository {
	return &seoArticleRepositoryImpl{db: db}
}

func (r *seoArticleRepositoryImpl) Create(ctx context.Context, article *models.SEOArticle) error {
	return r.db.WithContext(ctx).Create(article).Error
}

func (r *seoArticleRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.SEOArticle, error) {
	var article models.SEOArticle
	err := r.db.WithContext(ctx).First(&article, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *seoArticleRepositoryImpl) GetBySlug(ctx context.Context, slug string) (*models.SEOArticle, error) {
	var article models.SEOArticle
	err := r.db.WithContext(ctx).First(&article, "slug = ?", slug).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *seoArticleRepositoryImpl) GetByVideoID(ctx context.Context, videoID uuid.UUID) (*models.SEOArticle, error) {
	var article models.SEOArticle
	err := r.db.WithContext(ctx).First(&article, "video_id = ?", videoID).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

func (r *seoArticleRepositoryImpl) Update(ctx context.Context, article *models.SEOArticle) error {
	return r.db.WithContext(ctx).Save(article).Error
}

func (r *seoArticleRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.SEOArticle{}, "id = ?", id).Error
}

func (r *seoArticleRepositoryImpl) List(ctx context.Context, params repositories.SEOArticleListParams) ([]models.SEOArticle, int64, error) {
	var articles []models.SEOArticle
	var total int64

	query := r.db.WithContext(ctx).Model(&models.SEOArticle{})

	// Filters
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

func (r *seoArticleRepositoryImpl) GetStats(ctx context.Context) (*repositories.SEOArticleStats, error) {
	var stats repositories.SEOArticleStats

	// Total
	r.db.WithContext(ctx).Model(&models.SEOArticle{}).Count(&stats.TotalArticles)

	// By status
	r.db.WithContext(ctx).Model(&models.SEOArticle{}).Where("status = ?", models.SEOStatusDraft).Count(&stats.DraftCount)
	r.db.WithContext(ctx).Model(&models.SEOArticle{}).Where("status = ?", models.SEOStatusScheduled).Count(&stats.ScheduledCount)
	r.db.WithContext(ctx).Model(&models.SEOArticle{}).Where("status = ?", models.SEOStatusPublished).Count(&stats.PublishedCount)

	// By indexing status (only for published)
	r.db.WithContext(ctx).Model(&models.SEOArticle{}).
		Where("status = ? AND indexing_status = ?", models.SEOStatusPublished, models.IndexingIndexed).
		Count(&stats.IndexedCount)
	r.db.WithContext(ctx).Model(&models.SEOArticle{}).
		Where("status = ? AND indexing_status = ?", models.SEOStatusPublished, models.IndexingPending).
		Count(&stats.PendingIndex)
	r.db.WithContext(ctx).Model(&models.SEOArticle{}).
		Where("status = ? AND indexing_status = ?", models.SEOStatusPublished, models.IndexingFailed).
		Count(&stats.FailedIndex)

	return &stats, nil
}

func (r *seoArticleRepositoryImpl) UpdateStatus(ctx context.Context, id uuid.UUID, status models.SEOArticleStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}

	if status == models.SEOStatusPublished {
		now := time.Now()
		updates["published_at"] = now
	}

	return r.db.WithContext(ctx).Model(&models.SEOArticle{}).Where("id = ?", id).Updates(updates).Error
}

func (r *seoArticleRepositoryImpl) BulkSchedule(ctx context.Context, ids []uuid.UUID, scheduledAt []interface{}) error {
	// Use transaction for bulk update
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for i, id := range ids {
			if err := tx.Model(&models.SEOArticle{}).
				Where("id = ?", id).
				Updates(map[string]interface{}{
					"status":       models.SEOStatusScheduled,
					"scheduled_at": scheduledAt[i],
				}).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *seoArticleRepositoryImpl) GetScheduledToPublish(ctx context.Context) ([]models.SEOArticle, error) {
	var articles []models.SEOArticle
	err := r.db.WithContext(ctx).
		Where("status = ? AND scheduled_at <= ?", models.SEOStatusScheduled, time.Now()).
		Find(&articles).Error
	return articles, err
}

func (r *seoArticleRepositoryImpl) GetPendingIndexing(ctx context.Context, limit int) ([]models.SEOArticle, error) {
	var articles []models.SEOArticle
	err := r.db.WithContext(ctx).
		Where("status = ? AND indexing_status = ?", models.SEOStatusPublished, models.IndexingPending).
		Limit(limit).
		Find(&articles).Error
	return articles, err
}

func (r *seoArticleRepositoryImpl) UpdateIndexingStatus(ctx context.Context, id uuid.UUID, status models.IndexingStatus) error {
	updates := map[string]interface{}{
		"indexing_status": status,
	}

	if status == models.IndexingIndexed {
		now := time.Now()
		updates["indexed_at"] = now
	}

	return r.db.WithContext(ctx).Model(&models.SEOArticle{}).Where("id = ?", id).Updates(updates).Error
}

func (r *seoArticleRepositoryImpl) GetPublishedBySlug(ctx context.Context, slug string) (*models.SEOArticle, error) {
	var article models.SEOArticle
	err := r.db.WithContext(ctx).
		Where("slug = ? AND status = ?", slug, models.SEOStatusPublished).
		First(&article).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}
