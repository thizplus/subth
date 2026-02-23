package serviceimpl

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/ports"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gofiber-template/pkg/utils"
)

type VideoServiceImpl struct {
	videoRepo    repositories.VideoRepository
	makerRepo    repositories.MakerRepository
	castRepo     repositories.CastRepository
	tagRepo      repositories.TagRepository
	autoTagRepo  repositories.AutoTagLabelRepository
	categoryRepo repositories.CategoryRepository
	storage      ports.Storage
}

func NewVideoService(
	videoRepo repositories.VideoRepository,
	makerRepo repositories.MakerRepository,
	castRepo repositories.CastRepository,
	tagRepo repositories.TagRepository,
	autoTagRepo repositories.AutoTagLabelRepository,
	categoryRepo repositories.CategoryRepository,
	storage ports.Storage,
) services.VideoService {
	return &VideoServiceImpl{
		videoRepo:    videoRepo,
		makerRepo:    makerRepo,
		castRepo:     castRepo,
		tagRepo:      tagRepo,
		autoTagRepo:  autoTagRepo,
		categoryRepo: categoryRepo,
		storage:      storage,
	}
}

func (s *VideoServiceImpl) CreateVideo(ctx context.Context, req *dto.CreateVideoRequest) (*dto.VideoResponse, error) {
	// Parse release date
	var releaseDate *time.Time
	if req.ReleaseDate != "" {
		t, err := time.Parse("2006-01-02", req.ReleaseDate)
		if err != nil {
			logger.WarnContext(ctx, "Invalid release date format", "date", req.ReleaseDate)
			return nil, errors.New("invalid release date format")
		}
		releaseDate = &t
	}

	// Get or create maker
	var makerID *uuid.UUID
	if req.MakerName != "" {
		maker, err := s.makerRepo.GetOrCreateByName(ctx, req.MakerName)
		if err != nil {
			logger.ErrorContext(ctx, "Failed to get/create maker", "maker", req.MakerName, "error", err)
			return nil, err
		}
		makerID = &maker.ID
	}

	// Get or create categories (multi-category support)
	var categories []models.Category
	for _, catName := range req.Categories {
		if catName == "" {
			continue
		}
		category, err := s.categoryRepo.GetOrCreate(ctx, catName)
		if err != nil {
			logger.WarnContext(ctx, "Failed to get/create category", "category", catName, "error", err)
			continue
		}
		if category != nil {
			categories = append(categories, *category)
		}
	}

	// Extract code from EmbedURL (https://player.suekk.com/embed/{code})
	code := ""
	if req.EmbedURL != "" && strings.Contains(req.EmbedURL, "/embed/") {
		parts := strings.Split(req.EmbedURL, "/embed/")
		if len(parts) > 1 {
			code = parts[1]
		}
	}

	// Create video
	video := &models.Video{
		Code:        code,
		Thumbnail:   req.Thumbnail,
		EmbedURL:    req.EmbedURL,
		ReleaseDate: releaseDate,
		MakerID:     makerID,
	}

	if err := s.videoRepo.Create(ctx, video); err != nil {
		logger.ErrorContext(ctx, "Failed to create video", "error", err)
		return nil, err
	}

	// Add categories
	if len(categories) > 0 {
		if err := s.videoRepo.AddCategories(ctx, video.ID, categories); err != nil {
			logger.WarnContext(ctx, "Failed to add categories to video", "error", err)
		}
		// Increment video counts for each category
		for _, cat := range categories {
			_ = s.categoryRepo.IncrementVideoCount(ctx, cat.ID)
		}
	}

	// Create translations
	for lang, title := range req.Titles {
		trans := &models.VideoTranslation{
			VideoID: video.ID,
			Lang:    lang,
			Title:   title,
		}
		if err := s.videoRepo.CreateTranslation(ctx, trans); err != nil {
			logger.WarnContext(ctx, "Failed to create video translation", "lang", lang, "error", err)
		}
	}

	// Process casts - สร้าง cast และ link กับ video
	var casts []models.Cast
	for _, castName := range req.CastNames {
		cast, err := s.castRepo.GetOrCreateByName(ctx, castName)
		if err != nil {
			logger.WarnContext(ctx, "Failed to get/create cast", "cast", castName, "error", err)
			continue
		}
		casts = append(casts, *cast)
		_ = s.castRepo.IncrementVideoCount(ctx, cast.ID)
	}
	if len(casts) > 0 {
		if err := s.videoRepo.AddCasts(ctx, video.ID, casts); err != nil {
			logger.WarnContext(ctx, "Failed to add casts to video", "error", err)
		}
	}

	// Process tags - สร้าง tag และ link กับ video
	var tags []models.Tag
	for _, tagName := range req.TagNames {
		tag, err := s.tagRepo.GetOrCreateByName(ctx, tagName)
		if err != nil {
			logger.WarnContext(ctx, "Failed to get/create tag", "tag", tagName, "error", err)
			continue
		}
		tags = append(tags, *tag)
		_ = s.tagRepo.IncrementVideoCount(ctx, tag.ID)
	}
	if len(tags) > 0 {
		if err := s.videoRepo.AddTags(ctx, video.ID, tags); err != nil {
			logger.WarnContext(ctx, "Failed to add tags to video", "error", err)
		}
	}

	// Increment maker video count
	if makerID != nil {
		_ = s.makerRepo.IncrementVideoCount(ctx, *makerID)
	}

	logger.InfoContext(ctx, "Video created", "video_id", video.ID)

	return s.GetVideo(ctx, video.ID, "en")
}

func (s *VideoServiceImpl) CreateVideoBatch(ctx context.Context, req *dto.BatchCreateVideoRequest) (*dto.BatchCreateVideoResponse, error) {
	results := make([]dto.BatchCreateVideoItemResult, len(req.Videos))
	succeeded := 0
	failed := 0

	for i, videoReq := range req.Videos {
		// Create each video using existing CreateVideo logic
		video, err := s.createVideoInternal(ctx, &videoReq)
		if err != nil {
			results[i] = dto.BatchCreateVideoItemResult{
				Index:   i,
				Success: false,
				Error:   err.Error(),
			}
			failed++
			logger.WarnContext(ctx, "Batch create video failed", "index", i, "error", err)
		} else {
			results[i] = dto.BatchCreateVideoItemResult{
				Index:   i,
				Success: true,
				VideoID: &video.ID,
			}
			succeeded++
		}
	}

	logger.InfoContext(ctx, "Batch create completed", "total", len(req.Videos), "succeeded", succeeded, "failed", failed)

	return &dto.BatchCreateVideoResponse{
		Total:     len(req.Videos),
		Succeeded: succeeded,
		Failed:    failed,
		Results:   results,
	}, nil
}

// createVideoInternal - สร้าง video และ return model (ไม่ใช่ response)
func (s *VideoServiceImpl) createVideoInternal(ctx context.Context, req *dto.CreateVideoRequest) (*models.Video, error) {
	// Parse release date
	var releaseDate *time.Time
	if req.ReleaseDate != "" {
		t, err := time.Parse("2006-01-02", req.ReleaseDate)
		if err != nil {
			return nil, errors.New("invalid release date format")
		}
		releaseDate = &t
	}

	// Get or create maker
	var makerID *uuid.UUID
	if req.MakerName != "" {
		maker, err := s.makerRepo.GetOrCreateByName(ctx, req.MakerName)
		if err != nil {
			return nil, err
		}
		makerID = &maker.ID
	}

	// Get or create categories (multi-category support)
	var categories []models.Category
	for _, catName := range req.Categories {
		if catName == "" {
			continue
		}
		category, err := s.categoryRepo.GetOrCreate(ctx, catName)
		if err != nil {
			continue
		}
		if category != nil {
			categories = append(categories, *category)
		}
	}

	// Extract code from EmbedURL
	code := ""
	if req.EmbedURL != "" && strings.Contains(req.EmbedURL, "/embed/") {
		parts := strings.Split(req.EmbedURL, "/embed/")
		if len(parts) > 1 {
			code = parts[1]
		}
	}

	// Create video
	video := &models.Video{
		Code:        code,
		Thumbnail:   req.Thumbnail,
		EmbedURL:    req.EmbedURL,
		ReleaseDate: releaseDate,
		MakerID:     makerID,
	}

	if err := s.videoRepo.Create(ctx, video); err != nil {
		return nil, err
	}

	// Add categories
	if len(categories) > 0 {
		_ = s.videoRepo.AddCategories(ctx, video.ID, categories)
		for _, cat := range categories {
			_ = s.categoryRepo.IncrementVideoCount(ctx, cat.ID)
		}
	}

	// Create translations
	for lang, title := range req.Titles {
		trans := &models.VideoTranslation{
			VideoID: video.ID,
			Lang:    lang,
			Title:   title,
		}
		if err := s.videoRepo.CreateTranslation(ctx, trans); err != nil {
			logger.WarnContext(ctx, "Failed to create video translation", "lang", lang, "error", err)
		}
	}

	// Process casts - สร้าง cast และ link กับ video
	var casts []models.Cast
	for _, castName := range req.CastNames {
		cast, err := s.castRepo.GetOrCreateByName(ctx, castName)
		if err != nil {
			continue
		}
		casts = append(casts, *cast)
		_ = s.castRepo.IncrementVideoCount(ctx, cast.ID)
	}
	if len(casts) > 0 {
		_ = s.videoRepo.AddCasts(ctx, video.ID, casts)
	}

	// Process tags - สร้าง tag และ link กับ video
	var tags []models.Tag
	for _, tagName := range req.TagNames {
		tag, err := s.tagRepo.GetOrCreateByName(ctx, tagName)
		if err != nil {
			continue
		}
		tags = append(tags, *tag)
		_ = s.tagRepo.IncrementVideoCount(ctx, tag.ID)
	}
	if len(tags) > 0 {
		_ = s.videoRepo.AddTags(ctx, video.ID, tags)
	}

	// Increment maker video count
	if makerID != nil {
		_ = s.makerRepo.IncrementVideoCount(ctx, *makerID)
	}

	return video, nil
}

func (s *VideoServiceImpl) GetVideo(ctx context.Context, id uuid.UUID, lang string) (*dto.VideoResponse, error) {
	video, err := s.videoRepo.GetWithRelations(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("video not found")
		}
		logger.ErrorContext(ctx, "Failed to get video", "video_id", id, "error", err)
		return nil, err
	}

	return s.toVideoResponse(ctx, video, lang), nil
}


func (s *VideoServiceImpl) UpdateVideo(ctx context.Context, id uuid.UUID, req *dto.UpdateVideoRequest) (*dto.VideoResponse, error) {
	video, err := s.videoRepo.GetWithRelations(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("video not found")
		}
		return nil, err
	}

	// Track old categories for video count update
	oldCategories := video.Categories

	if req.Thumbnail != nil {
		video.Thumbnail = *req.Thumbnail
	}
	// ถ้าใส่ Code มาตรงๆ ให้ใช้ค่านั้น
	if req.Code != nil {
		video.Code = *req.Code
	}
	if req.EmbedURL != nil {
		video.EmbedURL = *req.EmbedURL
		// Extract code from EmbedURL เฉพาะเมื่อไม่ได้ใส่ Code มาตรงๆ
		if req.Code == nil && strings.Contains(*req.EmbedURL, "/embed/") {
			parts := strings.Split(*req.EmbedURL, "/embed/")
			if len(parts) > 1 {
				video.Code = parts[1]
			}
		}
	}
	if req.ReleaseDate != nil {
		t, err := time.Parse("2006-01-02", *req.ReleaseDate)
		if err == nil {
			video.ReleaseDate = &t
		}
	}
	if req.MakerName != nil {
		maker, err := s.makerRepo.GetOrCreateByName(ctx, *req.MakerName)
		if err == nil {
			video.MakerID = &maker.ID
		}
	}

	if err := s.videoRepo.Update(ctx, video); err != nil {
		logger.ErrorContext(ctx, "Failed to update video", "video_id", id, "error", err)
		return nil, err
	}

	// Update categories if provided
	if len(req.Categories) > 0 {
		var newCategories []models.Category
		for _, catName := range req.Categories {
			if catName == "" {
				continue
			}
			category, err := s.categoryRepo.GetOrCreate(ctx, catName)
			if err == nil && category != nil {
				newCategories = append(newCategories, *category)
			}
		}
		// Replace categories
		if err := s.videoRepo.ReplaceCategories(ctx, id, newCategories); err != nil {
			logger.WarnContext(ctx, "Failed to replace categories", "error", err)
		}
		// Update old category counts
		for _, cat := range oldCategories {
			_ = s.categoryRepo.UpdateVideoCount(ctx, cat.ID)
		}
		// Update new category counts
		for _, cat := range newCategories {
			_ = s.categoryRepo.UpdateVideoCount(ctx, cat.ID)
		}
	}

	// Update translations
	for lang, title := range req.Titles {
		trans, err := s.videoRepo.GetTranslation(ctx, id, lang)
		if err != nil {
			// Create new
			trans = &models.VideoTranslation{
				VideoID: id,
				Lang:    lang,
				Title:   title,
			}
			_ = s.videoRepo.CreateTranslation(ctx, trans)
		} else {
			// Update existing
			trans.Title = title
			_ = s.videoRepo.UpdateTranslation(ctx, trans)
		}
	}

	logger.InfoContext(ctx, "Video updated", "video_id", id)

	return s.GetVideo(ctx, id, "en")
}

func (s *VideoServiceImpl) DeleteVideo(ctx context.Context, id uuid.UUID) error {
	video, err := s.videoRepo.GetWithRelations(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("video not found")
		}
		return err
	}

	// เก็บ IDs ไว้ก่อนลบ associations
	categoryIDs := make([]uuid.UUID, len(video.Categories))
	for i, cat := range video.Categories {
		categoryIDs[i] = cat.ID
	}

	// ลบ thumbnail จาก R2 (ถ้ามี)
	logger.InfoContext(ctx, "Checking thumbnail for deletion", "video_id", id, "thumbnail", video.Thumbnail, "storage_nil", s.storage == nil)
	if video.Thumbnail != "" && s.storage != nil {
		thumbnailPath := strings.TrimPrefix(video.Thumbnail, "/")
		logger.InfoContext(ctx, "Deleting thumbnail from storage", "video_id", id, "path", thumbnailPath)
		if err := s.storage.Delete(ctx, thumbnailPath); err != nil {
			logger.WarnContext(ctx, "Failed to delete thumbnail from storage", "video_id", id, "path", thumbnailPath, "error", err)
		} else {
			logger.InfoContext(ctx, "Thumbnail deleted from storage", "video_id", id, "path", thumbnailPath)
		}
	}

	// ลบ translations ก่อน (foreign key constraint)
	if err := s.videoRepo.DeleteTranslations(ctx, id); err != nil {
		logger.WarnContext(ctx, "Failed to delete translations", "video_id", id, "error", err)
	}

	// ลบ many2many associations (video_casts, video_tags, video_categories)
	if err := s.videoRepo.ClearAssociations(ctx, id); err != nil {
		logger.WarnContext(ctx, "Failed to clear associations", "video_id", id, "error", err)
	}

	// ลบ video record
	if err := s.videoRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete video", "video_id", id, "error", err)
		return err
	}

	// Update counts หลังลบ associations แล้ว
	if video.MakerID != nil {
		_ = s.makerRepo.DecrementVideoCount(ctx, *video.MakerID)
	}
	for _, catID := range categoryIDs {
		_ = s.categoryRepo.DecrementVideoCount(ctx, catID)
	}
	for _, cast := range video.Casts {
		_ = s.castRepo.DecrementVideoCount(ctx, cast.ID)
	}
	for _, tag := range video.Tags {
		_ = s.tagRepo.DecrementVideoCount(ctx, tag.ID)
	}

	logger.InfoContext(ctx, "Video deleted", "video_id", id)
	return nil
}

func (s *VideoServiceImpl) ListVideos(ctx context.Context, req *dto.VideoListRequest) ([]dto.VideoListItemResponse, int64, error) {
	// Parse auto_tags
	var autoTags []string
	if req.AutoTags != "" {
		autoTags = strings.Split(req.AutoTags, ",")
	}

	// Parse maker_id
	var makerID *uuid.UUID
	if req.MakerID != "" {
		id, err := uuid.Parse(req.MakerID)
		if err == nil {
			makerID = &id
		}
	}

	// Normalize search query if it looks like a video code
	searchQuery := req.Search
	if searchQuery != "" && utils.IsVideoCodeQuery(searchQuery) {
		searchQuery = utils.NormalizeVideoCode(searchQuery)
		logger.InfoContext(ctx, "Normalized video code query", "original", req.Search, "normalized", searchQuery)
	}

	params := repositories.VideoListParams{
		Limit:     req.Limit,
		Offset:    (req.Page - 1) * req.Limit,
		Lang:      req.Lang,
		Search:    searchQuery,
		Category:  req.Category,
		MakerID:   makerID,
		AutoTags:  autoTags,
		SortBy:    req.SortBy,
		Order:     req.Order,
		MissingTh: req.MissingTh,
	}

	videos, total, err := s.videoRepo.List(ctx, params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list videos", "error", err)
		return nil, 0, err
	}

	return s.toVideoListItemResponses(videos, req.Lang), total, nil
}

func (s *VideoServiceImpl) GetRandomVideos(ctx context.Context, limit int, lang string) ([]dto.VideoListItemResponse, error) {
	videos, err := s.videoRepo.GetRandom(ctx, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get random videos", "error", err)
		return nil, err
	}

	return s.toVideoListItemResponses(videos, lang), nil
}

func (s *VideoServiceImpl) SearchVideos(ctx context.Context, query string, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error) {
	offset := (page - 1) * limit

	// Normalize video code query (e.g., "ftkd034" → "FTKD-034")
	normalizedQuery := query
	if utils.IsVideoCodeQuery(query) {
		normalizedQuery = utils.NormalizeVideoCode(query)
		logger.InfoContext(ctx, "Normalized video code query", "original", query, "normalized", normalizedQuery)
	}

	videos, total, err := s.videoRepo.SearchByTitle(ctx, normalizedQuery, lang, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search videos", "query", normalizedQuery, "error", err)
		return nil, 0, err
	}

	return s.toVideoListItemResponses(videos, lang), total, nil
}

func (s *VideoServiceImpl) GetVideosByMaker(ctx context.Context, makerID uuid.UUID, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error) {
	offset := (page - 1) * limit
	videos, total, err := s.videoRepo.GetByMakerID(ctx, makerID, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by maker", "maker_id", makerID, "error", err)
		return nil, 0, err
	}

	return s.toVideoListItemResponses(videos, lang), total, nil
}

func (s *VideoServiceImpl) GetVideosByCast(ctx context.Context, castID uuid.UUID, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error) {
	offset := (page - 1) * limit
	videos, total, err := s.videoRepo.GetByCastID(ctx, castID, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by cast", "cast_id", castID, "error", err)
		return nil, 0, err
	}

	return s.toVideoListItemResponses(videos, lang), total, nil
}

func (s *VideoServiceImpl) GetVideosByTag(ctx context.Context, tagID uuid.UUID, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error) {
	offset := (page - 1) * limit
	videos, total, err := s.videoRepo.GetByTagID(ctx, tagID, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by tag", "tag_id", tagID, "error", err)
		return nil, 0, err
	}

	return s.toVideoListItemResponses(videos, lang), total, nil
}

func (s *VideoServiceImpl) GetVideosByAutoTags(ctx context.Context, tags []string, lang string, page int, limit int) ([]dto.VideoListItemResponse, int64, error) {
	offset := (page - 1) * limit
	videos, total, err := s.videoRepo.GetByAutoTags(ctx, tags, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get videos by auto tags", "tags", tags, "error", err)
		return nil, 0, err
	}

	return s.toVideoListItemResponses(videos, lang), total, nil
}

func (s *VideoServiceImpl) GetVideosByCategories(ctx context.Context, req *dto.VideosByCategoriesRequest) ([]dto.CategoryWithVideosResponse, error) {
	// Set defaults
	limitPerCategory := req.LimitPerCategory
	if limitPerCategory <= 0 {
		limitPerCategory = 4
	}
	categoryCount := req.CategoryCount // 0 = all categories
	lang := req.Lang
	if lang == "" {
		lang = "th"
	}

	// Get all categories sorted by sort_order
	categories, err := s.categoryRepo.List(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get categories", "error", err)
		return nil, err
	}

	// Limit to requested category count (0 = no limit, show all)
	if categoryCount > 0 && len(categories) > categoryCount {
		categories = categories[:categoryCount]
	}

	// For each category, get videos
	result := make([]dto.CategoryWithVideosResponse, 0, len(categories))
	for _, cat := range categories {
		// Skip categories with no videos
		if cat.VideoCount == 0 {
			continue
		}

		// Get videos for this category
		params := repositories.VideoListParams{
			Limit:    limitPerCategory,
			Offset:   0,
			Lang:     lang,
			Category: cat.Slug,
			SortBy:   "date",
			Order:    "desc",
		}

		videos, _, err := s.videoRepo.List(ctx, params)
		if err != nil {
			logger.WarnContext(ctx, "Failed to get videos for category", "category", cat.Slug, "error", err)
			continue
		}

		// Get translated category name
		categoryName := cat.Name
		for _, t := range cat.Translations {
			if t.Lang == lang {
				categoryName = t.Name
				break
			}
		}

		categoryResp := dto.CategoryResponse{
			ID:         cat.ID,
			Name:       categoryName,
			Slug:       cat.Slug,
			VideoCount: cat.VideoCount,
		}

		result = append(result, dto.CategoryWithVideosResponse{
			Category: categoryResp,
			Videos:   s.toVideoListItemResponses(videos, lang),
		})
	}

	logger.InfoContext(ctx, "Got videos by categories", "categories", len(result), "limit_per_category", limitPerCategory)

	return result, nil
}

// Helper functions

func (s *VideoServiceImpl) toVideoResponse(ctx context.Context, video *models.Video, lang string) *dto.VideoResponse {
	// Get title by language
	title := ""
	translations := make(map[string]string)
	for _, t := range video.Translations {
		translations[t.Lang] = t.Title
		if t.Lang == lang {
			title = t.Title
		}
	}
	if title == "" && len(translations) > 0 {
		// Fallback to English or first available
		if en, ok := translations["en"]; ok {
			title = en
		} else {
			for _, t := range translations {
				title = t
				break
			}
		}
	}

	// Build maker response
	var maker *dto.MakerResponse
	if video.Maker != nil {
		maker = &dto.MakerResponse{
			ID:         video.Maker.ID,
			Name:       video.Maker.Name,
			Slug:       video.Maker.Slug,
			VideoCount: video.Maker.VideoCount,
		}
	}

	// Build cast responses
	casts := make([]dto.CastResponse, 0, len(video.Casts))
	for _, c := range video.Casts {
		name := c.Name
		// Get translated name
		for _, t := range c.Translations {
			if t.Lang == lang {
				name = t.Name
				break
			}
		}
		casts = append(casts, dto.CastResponse{
			ID:         c.ID,
			Name:       name,
			Slug:       c.Slug,
			VideoCount: c.VideoCount,
		})
	}

	// Build tag responses
	tags := make([]dto.TagResponse, 0, len(video.Tags))
	for _, t := range video.Tags {
		name := t.Name
		// Get translated name
		for _, trans := range t.Translations {
			if trans.Lang == lang {
				name = trans.Name
				break
			}
		}
		tags = append(tags, dto.TagResponse{
			ID:         t.ID,
			Name:       name,
			Slug:       t.Slug,
			VideoCount: t.VideoCount,
		})
	}

	// Build auto tag responses
	var autoTags []dto.AutoTagResponse
	if len(video.AutoTags) > 0 {
		labels, _ := s.autoTagRepo.GetByKeys(ctx, video.AutoTags)
		autoTags = make([]dto.AutoTagResponse, 0, len(labels))
		for _, l := range labels {
			autoTags = append(autoTags, dto.AutoTagResponse{
				Key:      l.Key,
				Name:     l.GetName(lang),
				Category: l.Category,
			})
		}
	}

	// Build category responses
	categoryResponses := make([]dto.CategoryResponse, 0, len(video.Categories))
	for _, cat := range video.Categories {
		catName := cat.Name
		// Check for translation
		for _, t := range cat.Translations {
			if t.Lang == lang {
				catName = t.Name
				break
			}
		}
		categoryResponses = append(categoryResponses, dto.CategoryResponse{
			ID:         cat.ID,
			Name:       catName,
			Slug:       cat.Slug,
			VideoCount: cat.VideoCount,
		})
	}

	releaseDate := ""
	if video.ReleaseDate != nil {
		releaseDate = video.ReleaseDate.Format("2006-01-02")
	}

	return &dto.VideoResponse{
		ID:           video.ID,
		Code:         video.Code,
		Title:        title,
		Translations: translations,
		Thumbnail:    video.Thumbnail,
		EmbedURL:     video.EmbedURL,
		Categories:   categoryResponses,
		ReleaseDate:  releaseDate,
		Maker:        maker,
		Casts:        casts,
		Tags:         tags,
		AutoTags:     autoTags,
		CreatedAt:    video.CreatedAt,
		UpdatedAt:    video.UpdatedAt,
	}
}

func (s *VideoServiceImpl) toVideoListItemResponses(videos []models.Video, lang string) []dto.VideoListItemResponse {
	result := make([]dto.VideoListItemResponse, 0, len(videos))
	for _, v := range videos {
		title := ""
		titleTh := ""
		for _, t := range v.Translations {
			if t.Lang == lang {
				title = t.Title
			}
			// เก็บชื่อไทยไว้แยก
			if t.Lang == "th" {
				titleTh = t.Title
			}
		}
		if title == "" {
			for _, t := range v.Translations {
				if t.Lang == "en" {
					title = t.Title
					break
				}
			}
		}
		if title == "" && len(v.Translations) > 0 {
			title = v.Translations[0].Title
		}

		makerName := ""
		if v.Maker != nil {
			makerName = v.Maker.Name
		}

		// Build category slugs
		categorySlugs := make([]string, 0, len(v.Categories))
		for _, cat := range v.Categories {
			categorySlugs = append(categorySlugs, cat.Slug)
		}

		releaseDate := ""
		if v.ReleaseDate != nil {
			releaseDate = v.ReleaseDate.Format("2006-01-02")
		}

		// Build cast list with translated names
		casts := make([]dto.CastListItemResponse, 0, len(v.Casts))
		for _, c := range v.Casts {
			name := c.Name
			// Get translated name if available
			for _, t := range c.Translations {
				if t.Lang == lang {
					name = t.Name
					break
				}
			}
			casts = append(casts, dto.CastListItemResponse{Name: name})
		}

		result = append(result, dto.VideoListItemResponse{
			ID:          v.ID,
			Code:        v.Code,
			Title:       title,
			TitleTh:     titleTh,
			Thumbnail:   v.Thumbnail,
			EmbedURL:    v.EmbedURL,
			Categories:  categorySlugs,
			ReleaseDate: releaseDate,
			MakerName:   makerName,
			Casts:       casts,
		})
	}
	return result
}

// GetVideosByEmbedCodes ค้นหา videos โดย embed codes
func (s *VideoServiceImpl) GetVideosByEmbedCodes(ctx context.Context, codes []string) ([]dto.VideoIDWithCode, error) {
	videos, err := s.videoRepo.GetByEmbedCodes(ctx, codes)
	if err != nil {
		return nil, err
	}

	result := make([]dto.VideoIDWithCode, 0, len(videos))
	for _, v := range videos {
		// Extract code from embed_url (last segment after /)
		code := ""
		if v.EmbedURL != "" {
			parts := strings.Split(v.EmbedURL, "/")
			if len(parts) > 0 {
				code = parts[len(parts)-1]
			}
		}
		result = append(result, dto.VideoIDWithCode{
			ID:       v.ID.String(),
			Code:     code,
			EmbedURL: v.EmbedURL,
		})
	}
	return result, nil
}

// DeleteVideosByEmbedCodes ลบ videos โดย embed codes
func (s *VideoServiceImpl) DeleteVideosByEmbedCodes(ctx context.Context, codes []string) (int, error) {
	videos, err := s.videoRepo.GetByEmbedCodes(ctx, codes)
	if err != nil {
		return 0, err
	}

	deleted := 0
	for _, v := range videos {
		if err := s.DeleteVideo(ctx, v.ID); err != nil {
			logger.WarnContext(ctx, "Failed to delete video by embed code", "video_id", v.ID, "error", err)
			continue
		}
		deleted++
	}
	return deleted, nil
}

// UpdateVideoGallery อัพเดท gallery info จาก worker
func (s *VideoServiceImpl) UpdateVideoGallery(ctx context.Context, id uuid.UUID, req *dto.UpdateGalleryRequest) error {
	// Calculate total count if not provided
	galleryCount := req.GalleryCount
	if galleryCount == 0 {
		galleryCount = req.SafeCount + req.NsfwCount
	}

	err := s.videoRepo.UpdateGallery(ctx, id, req.GalleryPath, galleryCount, req.SafeCount, req.NsfwCount)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("video not found")
		}
		logger.ErrorContext(ctx, "Failed to update video gallery", "video_id", id, "error", err)
		return err
	}

	logger.InfoContext(ctx, "Video gallery updated",
		"video_id", id,
		"gallery_path", req.GalleryPath,
		"safe_count", req.SafeCount,
		"nsfw_count", req.NsfwCount,
	)
	return nil
}

