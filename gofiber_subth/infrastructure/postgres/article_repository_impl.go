package postgres

import (
	"context"
	"encoding/json"
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

// ========================================
// Public Listing Methods (for SEO pages)
// ========================================

func (r *articleRepositoryImpl) ListPublished(ctx context.Context, params repositories.PublicArticleListParams) ([]repositories.PublishedArticleWithVideo, int64, error) {
	var total int64

	// Count total
	countQuery := r.db.WithContext(ctx).Model(&models.Article{}).
		Where("status = ?", models.ArticleStatusPublished)
	if params.Search != "" {
		countQuery = countQuery.Where("title ILIKE ? OR slug ILIKE ?", "%"+params.Search+"%", "%"+params.Search+"%")
	}
	countQuery.Count(&total)

	// Get articles with video
	var articles []models.Article
	query := r.db.WithContext(ctx).
		Where("status = ?", models.ArticleStatusPublished)
	if params.Search != "" {
		query = query.Where("title ILIKE ? OR slug ILIKE ?", "%"+params.Search+"%", "%"+params.Search+"%")
	}
	err := query.Order("published_at DESC").
		Offset(params.Offset).
		Limit(params.Limit).
		Find(&articles).Error
	if err != nil {
		return nil, 0, err
	}

	return r.enrichArticlesWithVideoData(ctx, articles), total, nil
}

func (r *articleRepositoryImpl) ListPublishedByCast(ctx context.Context, castSlug string, params repositories.PublicArticleListParams) ([]repositories.PublishedArticleWithVideo, int64, error) {
	var total int64

	// Subquery to find video IDs that have this cast
	videoIDsSubquery := r.db.Table("video_casts").
		Select("video_casts.video_id").
		Joins("JOIN casts ON casts.id = video_casts.cast_id").
		Where("casts.slug = ?", castSlug)

	// Count total
	r.db.WithContext(ctx).Model(&models.Article{}).
		Where("status = ? AND video_id IN (?)", models.ArticleStatusPublished, videoIDsSubquery).
		Count(&total)

	// Get articles
	var articles []models.Article
	err := r.db.WithContext(ctx).
		Where("status = ? AND video_id IN (?)", models.ArticleStatusPublished, videoIDsSubquery).
		Order("published_at DESC").
		Offset(params.Offset).
		Limit(params.Limit).
		Find(&articles).Error
	if err != nil {
		return nil, 0, err
	}

	return r.enrichArticlesWithVideoData(ctx, articles), total, nil
}

func (r *articleRepositoryImpl) ListPublishedByTag(ctx context.Context, tagSlug string, params repositories.PublicArticleListParams) ([]repositories.PublishedArticleWithVideo, int64, error) {
	var total int64

	// Subquery to find video IDs that have this tag
	videoIDsSubquery := r.db.Table("video_tags").
		Select("video_tags.video_id").
		Joins("JOIN tags ON tags.id = video_tags.tag_id").
		Where("tags.slug = ?", tagSlug)

	// Count total
	r.db.WithContext(ctx).Model(&models.Article{}).
		Where("status = ? AND video_id IN (?)", models.ArticleStatusPublished, videoIDsSubquery).
		Count(&total)

	// Get articles
	var articles []models.Article
	err := r.db.WithContext(ctx).
		Where("status = ? AND video_id IN (?)", models.ArticleStatusPublished, videoIDsSubquery).
		Order("published_at DESC").
		Offset(params.Offset).
		Limit(params.Limit).
		Find(&articles).Error
	if err != nil {
		return nil, 0, err
	}

	return r.enrichArticlesWithVideoData(ctx, articles), total, nil
}

func (r *articleRepositoryImpl) ListPublishedByMaker(ctx context.Context, makerSlug string, params repositories.PublicArticleListParams) ([]repositories.PublishedArticleWithVideo, int64, error) {
	var total int64

	// Subquery to find video IDs that have this maker
	videoIDsSubquery := r.db.Table("videos").
		Select("videos.id").
		Joins("JOIN makers ON makers.id = videos.maker_id").
		Where("makers.slug = ?", makerSlug)

	// Count total
	r.db.WithContext(ctx).Model(&models.Article{}).
		Where("status = ? AND video_id IN (?)", models.ArticleStatusPublished, videoIDsSubquery).
		Count(&total)

	// Get articles
	var articles []models.Article
	err := r.db.WithContext(ctx).
		Where("status = ? AND video_id IN (?)", models.ArticleStatusPublished, videoIDsSubquery).
		Order("published_at DESC").
		Offset(params.Offset).
		Limit(params.Limit).
		Find(&articles).Error
	if err != nil {
		return nil, 0, err
	}

	return r.enrichArticlesWithVideoData(ctx, articles), total, nil
}

// enrichArticlesWithVideoData ดึงข้อมูล video, cast, tag, maker สำหรับ articles
func (r *articleRepositoryImpl) enrichArticlesWithVideoData(ctx context.Context, articles []models.Article) []repositories.PublishedArticleWithVideo {
	if len(articles) == 0 {
		return []repositories.PublishedArticleWithVideo{}
	}

	// Collect video IDs
	videoIDs := make([]interface{}, len(articles))
	for i, a := range articles {
		videoIDs[i] = a.VideoID
	}

	// Get videos with preloaded relations
	var videos []models.Video
	r.db.WithContext(ctx).
		Preload("Maker").
		Preload("Casts").
		Preload("Tags").
		Where("id IN ?", videoIDs).
		Find(&videos)

	// Create video map
	videoMap := make(map[string]*models.Video)
	for i := range videos {
		videoMap[videos[i].ID.String()] = &videos[i]
	}

	// Build result
	result := make([]repositories.PublishedArticleWithVideo, len(articles))
	for i, a := range articles {
		item := repositories.PublishedArticleWithVideo{
			Article: a,
		}

		// Extract thumbnailUrl from article content JSON
		item.VideoThumbnail = extractThumbnailFromContent(a.Content)

		if video, ok := videoMap[a.VideoID.String()]; ok {
			item.VideoCode = video.Code

			if video.Maker != nil {
				item.MakerName = video.Maker.Name
				item.MakerSlug = video.Maker.Slug
			}

			for _, cast := range video.Casts {
				item.CastNames = append(item.CastNames, cast.Name)
				item.CastSlugs = append(item.CastSlugs, cast.Slug)
			}

			for _, tag := range video.Tags {
				item.TagNames = append(item.TagNames, tag.Name)
				item.TagSlugs = append(item.TagSlugs, tag.Slug)
			}
		}

		result[i] = item
	}

	return result
}

// extractThumbnailFromContent ดึง thumbnailUrl จาก article content JSON
func extractThumbnailFromContent(content []byte) string {
	if len(content) == 0 {
		return ""
	}

	var data struct {
		ThumbnailUrl string `json:"thumbnailUrl"`
	}

	if err := json.Unmarshal(content, &data); err != nil {
		return ""
	}

	return data.ThumbnailUrl
}
