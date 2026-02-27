package serviceimpl

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/ports"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/infrastructure/redis"
	"gofiber-template/pkg/cache"
	"gofiber-template/pkg/logger"
)

type ArticleServiceImpl struct {
	articleRepo repositories.ArticleRepository
	videoRepo   repositories.VideoRepository
	storage     ports.Storage
	cache       *redis.RedisClient
}

func NewArticleService(
	articleRepo repositories.ArticleRepository,
	videoRepo repositories.VideoRepository,
	storage ports.Storage,
	cache *redis.RedisClient,
) services.ArticleService {
	return &ArticleServiceImpl{
		articleRepo: articleRepo,
		videoRepo:   videoRepo,
		storage:     storage,
		cache:       cache,
	}
}

func (s *ArticleServiceImpl) IngestArticle(ctx context.Context, req *dto.IngestArticleRequest, content []byte) (*dto.ArticleDetailResponse, error) {
	videoID, err := uuid.Parse(req.VideoID)
	if err != nil {
		logger.WarnContext(ctx, "Invalid video ID", "video_id", req.VideoID, "error", err)
		return nil, errors.New("invalid video_id")
	}

	// ตรวจสอบว่า video มีอยู่จริง
	video, err := s.videoRepo.GetByID(ctx, videoID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.WarnContext(ctx, "Video not found", "video_id", videoID)
			return nil, errors.New("video not found")
		}
		logger.ErrorContext(ctx, "Failed to get video", "video_id", videoID, "error", err)
		return nil, err
	}

	// Default type to "review" if not specified
	articleType := models.ArticleTypeReview
	if req.Type != "" {
		articleType = models.ArticleType(req.Type)
	}

	// Default language to "th" if not specified
	language := "th"
	if req.Language != "" {
		language = req.Language
	}

	// ตรวจสอบว่ามี article สำหรับ video + language นี้แล้วหรือไม่
	existing, _ := s.articleRepo.GetByVideoIDAndLanguage(ctx, videoID, language)
	if existing != nil {
		// Update existing article
		existing.Type = articleType
		existing.Title = req.Title
		existing.MetaTitle = req.MetaTitle
		existing.MetaDescription = req.MetaDescription
		existing.Slug = req.Slug
		existing.Content = json.RawMessage(content)
		existing.QualityScore = req.QualityScore
		existing.ReadingTime = req.ReadingTime

		if err := s.articleRepo.Update(ctx, existing); err != nil {
			logger.ErrorContext(ctx, "Failed to update article", "article_id", existing.ID, "error", err)
			return nil, err
		}

		// Invalidate cache when article is updated
		if s.cache != nil {
			cacheKey := cache.ArticleKeyWithLang(string(existing.Type), existing.Slug, existing.Language)
			_ = s.cache.Delete(ctx, cacheKey)
		}

		logger.InfoContext(ctx, "Article updated", "article_id", existing.ID, "video_id", videoID, "language", language)
		return s.mapToDetailResponse(existing, video), nil
	}

	// Create new article
	article := &models.Article{
		VideoID:         videoID,
		Language:        language,
		Type:            articleType,
		Title:           req.Title,
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		Slug:            req.Slug,
		Content:         json.RawMessage(content),
		Status:          models.ArticleStatusDraft,
		IndexingStatus:  models.IndexingPending,
		QualityScore:    req.QualityScore,
		ReadingTime:     req.ReadingTime,
	}

	if err := s.articleRepo.Create(ctx, article); err != nil {
		logger.ErrorContext(ctx, "Failed to create article", "video_id", videoID, "language", language, "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Article created", "article_id", article.ID, "video_id", videoID, "language", language)
	return s.mapToDetailResponse(article, video), nil
}

func (s *ArticleServiceImpl) GetArticle(ctx context.Context, id uuid.UUID) (*dto.ArticleDetailResponse, error) {
	article, err := s.articleRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("article not found")
		}
		logger.ErrorContext(ctx, "Failed to get article", "article_id", id, "error", err)
		return nil, err
	}

	video, _ := s.videoRepo.GetByID(ctx, article.VideoID)
	return s.mapToDetailResponse(article, video), nil
}

func (s *ArticleServiceImpl) GetArticleBySlug(ctx context.Context, slug string) (*dto.ArticleDetailResponse, error) {
	article, err := s.articleRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("article not found")
		}
		logger.ErrorContext(ctx, "Failed to get article by slug", "slug", slug, "error", err)
		return nil, err
	}

	video, _ := s.videoRepo.GetByID(ctx, article.VideoID)
	return s.mapToDetailResponse(article, video), nil
}

func (s *ArticleServiceImpl) DeleteArticle(ctx context.Context, id uuid.UUID) error {
	article, err := s.articleRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("article not found")
		}
		logger.ErrorContext(ctx, "Failed to get article for delete", "article_id", id, "error", err)
		return err
	}

	// Get video to get the videoCode (used for R2 path)
	video, err := s.videoRepo.GetByID(ctx, article.VideoID)
	if err != nil {
		logger.WarnContext(ctx, "Failed to get video for R2 cleanup", "video_id", article.VideoID, "error", err)
		// Continue with deletion even if video not found
	}

	// Delete article from database first
	if err := s.articleRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete article", "article_id", id, "error", err)
		return err
	}

	// Delete R2 files
	// SEO Worker เก็บที่:
	// - articles/{videoCode}/ (cover, images)
	// - audio/articles/{videoCode}/ (TTS audio)
	if s.storage != nil && video != nil && video.Code != "" {
		// Delete article files (cover, gallery)
		articlePrefix := fmt.Sprintf("articles/%s/", video.Code)
		deletedCount, err := s.storage.DeleteByPrefix(ctx, articlePrefix)
		if err != nil {
			logger.WarnContext(ctx, "Failed to delete R2 article files", "article_id", id, "prefix", articlePrefix, "error", err)
		} else if deletedCount > 0 {
			logger.InfoContext(ctx, "R2 article files deleted", "article_id", id, "prefix", articlePrefix, "count", deletedCount)
		}

		// Delete audio files (TTS summary)
		audioPrefix := fmt.Sprintf("audio/articles/%s/", video.Code)
		audioDeleted, err := s.storage.DeleteByPrefix(ctx, audioPrefix)
		if err != nil {
			logger.WarnContext(ctx, "Failed to delete R2 audio files", "article_id", id, "prefix", audioPrefix, "error", err)
		} else if audioDeleted > 0 {
			logger.InfoContext(ctx, "R2 audio files deleted", "article_id", id, "prefix", audioPrefix, "count", audioDeleted)
		}
	}

	logger.InfoContext(ctx, "Article deleted", "article_id", id)
	return nil
}

func (s *ArticleServiceImpl) ListArticles(ctx context.Context, params *dto.ArticleListParams) ([]dto.ArticleListItemResponse, int64, error) {
	params.SetDefaults()

	repoParams := repositories.ArticleListParams{
		Limit:          params.Limit,
		Offset:         (params.Page - 1) * params.Limit,
		Type:           params.Type,
		Status:         params.Status,
		IndexingStatus: params.IndexingStatus,
		Search:         params.Search,
		SortBy:         params.SortBy,
		Order:          params.Order,
	}

	articles, total, err := s.articleRepo.List(ctx, repoParams)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles", "error", err)
		return nil, 0, err
	}

	// ดึง video IDs เพื่อ get video codes
	videoIDs := make([]uuid.UUID, 0, len(articles))
	for _, a := range articles {
		videoIDs = append(videoIDs, a.VideoID)
	}

	videoMap := make(map[uuid.UUID]*models.Video)
	for _, vid := range videoIDs {
		if v, err := s.videoRepo.GetByID(ctx, vid); err == nil {
			videoMap[vid] = v
		}
	}

	result := make([]dto.ArticleListItemResponse, 0, len(articles))
	for _, a := range articles {
		item := dto.ArticleListItemResponse{
			ID:             a.ID.String(),
			VideoID:        a.VideoID.String(),
			Language:       a.Language,
			Type:           string(a.Type),
			Slug:           a.Slug,
			Title:          a.Title,
			Status:         string(a.Status),
			IndexingStatus: string(a.IndexingStatus),
			QualityScore:   a.QualityScore,
			ReadingTime:    a.ReadingTime,
			CreatedAt:      a.CreatedAt.Format(time.RFC3339),
		}

		// ใช้ thumbnail จาก article content (SEO-safe) แทน video.Thumbnail
		item.VideoThumbnail = extractThumbnailFromContent(a.Content)

		if video, ok := videoMap[a.VideoID]; ok && video != nil {
			item.VideoCode = video.Code
		}

		if a.ScheduledAt != nil {
			t := a.ScheduledAt.Format(time.RFC3339)
			item.ScheduledAt = &t
		}
		if a.PublishedAt != nil {
			t := a.PublishedAt.Format(time.RFC3339)
			item.PublishedAt = &t
		}

		result = append(result, item)
	}

	return result, total, nil
}

func (s *ArticleServiceImpl) GetStats(ctx context.Context) (*dto.ArticleStatsResponse, error) {
	stats, err := s.articleRepo.GetStats(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get article stats", "error", err)
		return nil, err
	}

	return &dto.ArticleStatsResponse{
		TotalArticles:  int(stats.TotalArticles),
		DraftCount:     int(stats.DraftCount),
		ScheduledCount: int(stats.ScheduledCount),
		PublishedCount: int(stats.PublishedCount),
		IndexedCount:   int(stats.IndexedCount),
		PendingIndex:   int(stats.PendingIndex),
		FailedIndex:    int(stats.FailedIndex),
	}, nil
}

func (s *ArticleServiceImpl) UpdateStatus(ctx context.Context, id uuid.UUID, req *dto.UpdateArticleStatusRequest) error {
	article, err := s.articleRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("article not found")
		}
		logger.ErrorContext(ctx, "Failed to get article for status update", "article_id", id, "error", err)
		return err
	}

	status := models.ArticleStatus(req.Status)

	// Validate status transition
	switch status {
	case models.ArticleStatusScheduled:
		if req.ScheduledAt == nil {
			return errors.New("scheduledAt is required for scheduled status")
		}
		article.ScheduledAt = req.ScheduledAt
	case models.ArticleStatusPublished:
		now := time.Now()
		article.PublishedAt = &now
	}

	article.Status = status

	if err := s.articleRepo.Update(ctx, article); err != nil {
		logger.ErrorContext(ctx, "Failed to update article status", "article_id", id, "error", err)
		return err
	}

	// Invalidate cache when article is published or status changes
	if s.cache != nil {
		cacheKey := cache.ArticleKeyWithLang(string(article.Type), article.Slug, article.Language)
		if err := s.cache.Delete(ctx, cacheKey); err != nil {
			logger.WarnContext(ctx, "Failed to invalidate article cache", "article_id", id, "error", err)
		} else {
			logger.InfoContext(ctx, "Article cache invalidated", "article_id", id, "cache_key", cacheKey)
		}
		// Also invalidate first page of list cache
		_ = s.cache.Delete(ctx, cache.ArticleListKey(1, 24))
	}

	logger.InfoContext(ctx, "Article status updated", "article_id", id, "status", status)
	return nil
}

func (s *ArticleServiceImpl) BulkSchedule(ctx context.Context, req *dto.BulkScheduleRequest) error {
	ids := make([]uuid.UUID, 0, len(req.ArticleIDs))
	scheduledTimes := make([]interface{}, 0, len(req.ArticleIDs))

	baseTime := req.ScheduledAt
	for i, idStr := range req.ArticleIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			logger.WarnContext(ctx, "Invalid article ID in bulk schedule", "id", idStr, "error", err)
			continue
		}
		ids = append(ids, id)

		// Calculate scheduled time with interval
		scheduledTime := baseTime.Add(time.Duration(i*req.Interval) * time.Minute)
		scheduledTimes = append(scheduledTimes, scheduledTime)
	}

	if len(ids) == 0 {
		return errors.New("no valid article IDs provided")
	}

	if err := s.articleRepo.BulkSchedule(ctx, ids, scheduledTimes); err != nil {
		logger.ErrorContext(ctx, "Failed to bulk schedule articles", "count", len(ids), "error", err)
		return err
	}

	logger.InfoContext(ctx, "Articles bulk scheduled", "count", len(ids), "start_time", baseTime)
	return nil
}

func (s *ArticleServiceImpl) PublishScheduledArticles(ctx context.Context) (int, error) {
	articles, err := s.articleRepo.GetScheduledToPublish(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get scheduled articles", "error", err)
		return 0, err
	}

	count := 0
	for _, article := range articles {
		if err := s.articleRepo.UpdateStatus(ctx, article.ID, models.ArticleStatusPublished); err != nil {
			logger.ErrorContext(ctx, "Failed to publish scheduled article", "article_id", article.ID, "error", err)
			continue
		}
		count++
		logger.InfoContext(ctx, "Scheduled article published", "article_id", article.ID)
	}

	return count, nil
}

func (s *ArticleServiceImpl) GetPublishedArticle(ctx context.Context, slug string) (*dto.PublicArticleResponse, error) {
	article, err := s.articleRepo.GetPublishedBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("article not found")
		}
		logger.ErrorContext(ctx, "Failed to get published article", "slug", slug, "error", err)
		return nil, err
	}

	video, _ := s.videoRepo.GetByID(ctx, article.VideoID)

	var content map[string]interface{}
	if err := json.Unmarshal(article.Content, &content); err != nil {
		logger.ErrorContext(ctx, "Failed to unmarshal article content", "article_id", article.ID, "error", err)
		return nil, err
	}

	response := &dto.PublicArticleResponse{
		Slug:            article.Slug,
		Type:            string(article.Type),
		Title:           article.Title,
		MetaTitle:       article.MetaTitle,
		MetaDescription: article.MetaDescription,
		Content:         content,
	}

	if video != nil {
		response.VideoCode = video.Code
	}
	if article.PublishedAt != nil {
		response.PublishedAt = article.PublishedAt.Format(time.RFC3339)
	}

	return response, nil
}

func (s *ArticleServiceImpl) GetPublishedArticleByType(ctx context.Context, articleType string, slug string) (*dto.PublicArticleResponse, error) {
	// Validate article type
	if !models.IsValidArticleType(articleType) {
		return nil, errors.New("invalid article type")
	}

	// 1. Try cache first
	cacheKey := cache.ArticleKey(articleType, slug)
	if s.cache != nil {
		var cached dto.PublicArticleResponse
		if err := s.cache.Get(ctx, cacheKey, &cached); err == nil {
			logger.InfoContext(ctx, "Article cache hit", "type", articleType, "slug", slug)
			return &cached, nil
		}
	}

	// 2. Fetch from DB
	article, err := s.articleRepo.GetPublishedByTypeAndSlug(ctx, articleType, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("article not found")
		}
		logger.ErrorContext(ctx, "Failed to get published article by type", "type", articleType, "slug", slug, "error", err)
		return nil, err
	}

	video, _ := s.videoRepo.GetByID(ctx, article.VideoID)

	var content map[string]interface{}
	if err := json.Unmarshal(article.Content, &content); err != nil {
		logger.ErrorContext(ctx, "Failed to unmarshal article content", "article_id", article.ID, "error", err)
		return nil, err
	}

	response := &dto.PublicArticleResponse{
		Slug:            article.Slug,
		Type:            string(article.Type),
		Title:           article.Title,
		MetaTitle:       article.MetaTitle,
		MetaDescription: article.MetaDescription,
		Content:         content,
	}

	if video != nil {
		response.VideoCode = video.Code
	}
	if article.PublishedAt != nil {
		response.PublishedAt = article.PublishedAt.Format(time.RFC3339)
	}

	// 3. Cache for next time
	if s.cache != nil {
		if err := s.cache.Set(ctx, cacheKey, response, cache.ArticleCacheTTL); err != nil {
			logger.WarnContext(ctx, "Failed to cache article", "type", articleType, "slug", slug, "error", err)
		}
	}

	return response, nil
}

// ========================================
// Public Listing Methods (for SEO pages)
// ========================================

func (s *ArticleServiceImpl) ListPublishedArticles(ctx context.Context, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error) {
	params.SetDefaults()

	repoParams := repositories.PublicArticleListParams{
		Limit:       params.Limit,
		Offset:      (params.Page - 1) * params.Limit,
		Search:      params.Search,
		ArticleType: params.Type,
		Language:    params.Lang,
	}

	articles, total, err := s.articleRepo.ListPublished(ctx, repoParams)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list published articles", "error", err)
		return nil, 0, err
	}

	return s.mapToPublicSummaries(articles), total, nil
}

func (s *ArticleServiceImpl) ListArticlesByCast(ctx context.Context, castSlug string, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error) {
	params.SetDefaults()

	repoParams := repositories.PublicArticleListParams{
		Limit:    params.Limit,
		Offset:   (params.Page - 1) * params.Limit,
		Language: params.Lang,
	}

	articles, total, err := s.articleRepo.ListPublishedByCast(ctx, castSlug, repoParams)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles by cast", "cast_slug", castSlug, "error", err)
		return nil, 0, err
	}

	return s.mapToPublicSummaries(articles), total, nil
}

func (s *ArticleServiceImpl) ListArticlesByTag(ctx context.Context, tagSlug string, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error) {
	params.SetDefaults()

	repoParams := repositories.PublicArticleListParams{
		Limit:    params.Limit,
		Offset:   (params.Page - 1) * params.Limit,
		Language: params.Lang,
	}

	articles, total, err := s.articleRepo.ListPublishedByTag(ctx, tagSlug, repoParams)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles by tag", "tag_slug", tagSlug, "error", err)
		return nil, 0, err
	}

	return s.mapToPublicSummaries(articles), total, nil
}

func (s *ArticleServiceImpl) ListArticlesByMaker(ctx context.Context, makerSlug string, params *dto.PublicArticleListParams) ([]dto.PublicArticleSummary, int64, error) {
	params.SetDefaults()

	repoParams := repositories.PublicArticleListParams{
		Limit:    params.Limit,
		Offset:   (params.Page - 1) * params.Limit,
		Language: params.Lang,
	}

	articles, total, err := s.articleRepo.ListPublishedByMaker(ctx, makerSlug, repoParams)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list articles by maker", "maker_slug", makerSlug, "error", err)
		return nil, 0, err
	}

	return s.mapToPublicSummaries(articles), total, nil
}

// mapToPublicSummaries แปลง repository result เป็น DTO
func (s *ArticleServiceImpl) mapToPublicSummaries(articles []repositories.PublishedArticleWithVideo) []dto.PublicArticleSummary {
	result := make([]dto.PublicArticleSummary, len(articles))
	for i, a := range articles {
		item := dto.PublicArticleSummary{
			Slug:            a.Slug,
			Language:        a.Language,
			Type:            string(a.Type),
			Title:           a.Title,
			MetaDescription: a.MetaDescription,
			ThumbnailUrl:    a.VideoThumbnail,
			VideoCode:       a.VideoCode,
			QualityScore:    a.QualityScore,
			CastNames:       a.CastNames,
			MakerName:       a.MakerName,
			Tags:            a.TagNames,
		}

		if a.PublishedAt != nil {
			item.PublishedAt = a.PublishedAt.Format(time.RFC3339)
		}

		result[i] = item
	}
	return result
}

// ClearArticleCache clears the cache for a specific article
func (s *ArticleServiceImpl) ClearArticleCache(ctx context.Context, articleType string, slug string) error {
	if s.cache == nil {
		return errors.New("cache not available")
	}

	cacheKey := cache.ArticleKey(articleType, slug)
	if err := s.cache.Delete(ctx, cacheKey); err != nil {
		logger.WarnContext(ctx, "Failed to clear article cache", "type", articleType, "slug", slug, "error", err)
		return err
	}

	logger.InfoContext(ctx, "Article cache cleared", "type", articleType, "slug", slug, "cache_key", cacheKey)
	return nil
}

// Helper to map article to detail response
func (s *ArticleServiceImpl) mapToDetailResponse(article *models.Article, video *models.Video) *dto.ArticleDetailResponse {
	var content map[string]interface{}
	if article.Content != nil {
		json.Unmarshal(article.Content, &content)
	}

	resp := &dto.ArticleDetailResponse{
		ID:              article.ID.String(),
		VideoID:         article.VideoID.String(),
		Language:        article.Language,
		Type:            string(article.Type),
		Slug:            article.Slug,
		Title:           article.Title,
		MetaTitle:       article.MetaTitle,
		MetaDescription: article.MetaDescription,
		Content:         content,
		Status:          string(article.Status),
		IndexingStatus:  string(article.IndexingStatus),
		QualityScore:    article.QualityScore,
		ReadingTime:     article.ReadingTime,
		CreatedAt:       article.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       article.UpdatedAt.Format(time.RFC3339),
	}

	if video != nil {
		resp.VideoCode = video.Code
	}

	if article.ScheduledAt != nil {
		t := article.ScheduledAt.Format(time.RFC3339)
		resp.ScheduledAt = &t
	}
	if article.PublishedAt != nil {
		t := article.PublishedAt.Format(time.RFC3339)
		resp.PublishedAt = &t
	}
	if article.IndexedAt != nil {
		t := article.IndexedAt.Format(time.RFC3339)
		resp.IndexedAt = &t
	}

	return resp
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
