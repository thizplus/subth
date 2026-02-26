package serviceimpl

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type TagServiceImpl struct {
	tagRepo     repositories.TagRepository
	autoTagRepo repositories.AutoTagLabelRepository
}

func NewTagService(tagRepo repositories.TagRepository, autoTagRepo repositories.AutoTagLabelRepository) services.TagService {
	return &TagServiceImpl{
		tagRepo:     tagRepo,
		autoTagRepo: autoTagRepo,
	}
}

func (s *TagServiceImpl) CreateTag(ctx context.Context, req *dto.CreateTagRequest) (*dto.TagDetailResponse, error) {
	// ตรวจสอบว่ามี tag ชื่อนี้แล้วหรือไม่
	existing, _ := s.tagRepo.GetByName(ctx, req.Name)
	if existing != nil {
		logger.WarnContext(ctx, "Tag already exists", "name", req.Name)
		return nil, errors.New("tag already exists")
	}

	tag := &models.Tag{
		Name: req.Name,
		Slug: slug.Make(req.Name),
	}

	if err := s.tagRepo.Create(ctx, tag); err != nil {
		logger.ErrorContext(ctx, "Failed to create tag", "name", req.Name, "error", err)
		return nil, err
	}

	// สร้าง translations ถ้ามี
	if req.Translations != nil {
		for lang, name := range req.Translations {
			if name == "" {
				continue
			}
			trans := &models.TagTranslation{
				TagID: tag.ID,
				Lang:  lang,
				Name:  name,
			}
			if err := s.tagRepo.CreateTranslation(ctx, trans); err != nil {
				logger.WarnContext(ctx, "Failed to create tag translation", "tag_id", tag.ID, "lang", lang, "error", err)
			}
		}
	}

	logger.InfoContext(ctx, "Tag created", "tag_id", tag.ID, "name", tag.Name)

	// ดึง tag พร้อม translations
	return s.GetTag(ctx, tag.ID, "en")
}

func (s *TagServiceImpl) UpdateTag(ctx context.Context, id uuid.UUID, req *dto.UpdateTagRequest) (*dto.TagDetailResponse, error) {
	tag, err := s.tagRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("tag not found")
		}
		logger.ErrorContext(ctx, "Failed to get tag for update", "tag_id", id, "error", err)
		return nil, err
	}

	// Update name ถ้ามีส่งมา
	if req.Name != nil && *req.Name != tag.Name {
		// ตรวจสอบว่าชื่อใหม่ไม่ซ้ำกับ tag อื่น
		existing, _ := s.tagRepo.GetByName(ctx, *req.Name)
		if existing != nil && existing.ID != id {
			logger.WarnContext(ctx, "Tag name already exists", "name", *req.Name)
			return nil, errors.New("tag name already exists")
		}
		tag.Name = *req.Name
		tag.Slug = slug.Make(*req.Name)
	}

	if err := s.tagRepo.Update(ctx, tag); err != nil {
		logger.ErrorContext(ctx, "Failed to update tag", "tag_id", id, "error", err)
		return nil, err
	}

	// Update translations ถ้ามีส่งมา (ลบทั้งหมดแล้วสร้างใหม่)
	if req.Translations != nil {
		// ลบ translations เดิมทั้งหมด
		if err := s.tagRepo.DeleteTranslationsByTagID(ctx, id); err != nil {
			logger.WarnContext(ctx, "Failed to delete tag translations", "tag_id", id, "error", err)
		}

		// สร้าง translations ใหม่
		for lang, name := range req.Translations {
			if name == "" {
				continue
			}
			trans := &models.TagTranslation{
				TagID: tag.ID,
				Lang:  lang,
				Name:  name,
			}
			if err := s.tagRepo.CreateTranslation(ctx, trans); err != nil {
				logger.WarnContext(ctx, "Failed to create tag translation", "tag_id", id, "lang", lang, "error", err)
			}
		}
	}

	logger.InfoContext(ctx, "Tag updated", "tag_id", id)

	// ดึง tag พร้อม translations
	return s.GetTag(ctx, tag.ID, "en")
}

func (s *TagServiceImpl) DeleteTag(ctx context.Context, id uuid.UUID) error {
	// ตรวจสอบว่ามี tag นี้อยู่หรือไม่
	tag, err := s.tagRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("tag not found")
		}
		logger.ErrorContext(ctx, "Failed to get tag for delete", "tag_id", id, "error", err)
		return err
	}

	// ตรวจสอบว่ามี video ที่ใช้ tag นี้อยู่หรือไม่
	if tag.VideoCount > 0 {
		logger.WarnContext(ctx, "Cannot delete tag with videos", "tag_id", id, "video_count", tag.VideoCount)
		return errors.New("cannot delete tag with associated videos")
	}

	// ลบ translations ก่อน
	if err := s.tagRepo.DeleteTranslationsByTagID(ctx, id); err != nil {
		logger.WarnContext(ctx, "Failed to delete tag translations", "tag_id", id, "error", err)
	}

	if err := s.tagRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete tag", "tag_id", id, "error", err)
		return err
	}

	logger.InfoContext(ctx, "Tag deleted", "tag_id", id)
	return nil
}

func (s *TagServiceImpl) GetTag(ctx context.Context, id uuid.UUID, lang string) (*dto.TagDetailResponse, error) {
	tag, err := s.tagRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("tag not found")
		}
		logger.ErrorContext(ctx, "Failed to get tag", "tag_id", id, "error", err)
		return nil, err
	}

	return s.toTagDetailResponse(tag, lang), nil
}

func (s *TagServiceImpl) GetTagBySlug(ctx context.Context, slug string, lang string) (*dto.TagDetailResponse, error) {
	tag, err := s.tagRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("tag not found")
		}
		logger.ErrorContext(ctx, "Failed to get tag by slug", "slug", slug, "error", err)
		return nil, err
	}

	return s.toTagDetailResponse(tag, lang), nil
}

func (s *TagServiceImpl) ListTags(ctx context.Context, req *dto.TagListRequest) ([]dto.TagResponse, int64, error) {
	params := repositories.TagListParams{
		Limit:       req.Limit,
		Offset:      (req.Page - 1) * req.Limit,
		Lang:        req.Lang,
		Search:      req.Search,
		SortBy:      req.SortBy,
		Order:       req.Order,
		HasArticles: req.HasArticles,
	}

	// Parse IDs if provided (batch fetch mode)
	if req.IDs != "" {
		ids := strings.Split(req.IDs, ",")
		params.IDs = make([]string, 0, len(ids))
		for _, id := range ids {
			id = strings.TrimSpace(id)
			if id != "" {
				params.IDs = append(params.IDs, id)
			}
		}
		// In batch mode, increase limit to cover all IDs
		if len(params.IDs) > 0 {
			params.Limit = len(params.IDs)
			params.Offset = 0
		}
	}

	tags, total, err := s.tagRepo.List(ctx, params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list tags", "error", err)
		return nil, 0, err
	}

	return s.toTagResponses(tags, req.Lang), total, nil
}

func (s *TagServiceImpl) SearchTags(ctx context.Context, query string, lang string, limit int) ([]dto.TagResponse, error) {
	tags, err := s.tagRepo.Search(ctx, query, lang, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search tags", "query", query, "error", err)
		return nil, err
	}

	return s.toTagResponses(tags, lang), nil
}

func (s *TagServiceImpl) GetTopTags(ctx context.Context, limit int, lang string) ([]dto.TagResponse, error) {
	params := repositories.TagListParams{
		Limit:  limit,
		Offset: 0,
		Lang:   lang,
		SortBy: "video_count",
		Order:  "desc",
	}

	tags, _, err := s.tagRepo.List(ctx, params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top tags", "error", err)
		return nil, err
	}

	return s.toTagResponses(tags, lang), nil
}

func (s *TagServiceImpl) ListAutoTags(ctx context.Context, lang string, category string) ([]dto.AutoTagLabelResponse, error) {
	var labels []models.AutoTagLabel
	var err error

	if category != "" {
		labels, err = s.autoTagRepo.GetByCategory(ctx, category)
	} else {
		labels, err = s.autoTagRepo.GetAll(ctx)
	}

	if err != nil {
		logger.ErrorContext(ctx, "Failed to list auto tags", "category", category, "error", err)
		return nil, err
	}

	result := make([]dto.AutoTagLabelResponse, 0, len(labels))
	for _, l := range labels {
		result = append(result, dto.AutoTagLabelResponse{
			Key:      l.Key,
			Name:     l.GetName(lang),
			Category: l.Category,
		})
	}

	return result, nil
}

func (s *TagServiceImpl) GetAutoTagsByKeys(ctx context.Context, keys []string, lang string) ([]dto.AutoTagResponse, error) {
	labels, err := s.autoTagRepo.GetByKeys(ctx, keys)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get auto tags by keys", "keys", keys, "error", err)
		return nil, err
	}

	result := make([]dto.AutoTagResponse, 0, len(labels))
	for _, l := range labels {
		result = append(result, dto.AutoTagResponse{
			Key:      l.Key,
			Name:     l.GetName(lang),
			Category: l.Category,
		})
	}

	return result, nil
}

// Helper functions

func (s *TagServiceImpl) toTagResponse(tag *models.Tag, lang string) dto.TagResponse {
	name := tag.Name
	for _, t := range tag.Translations {
		if t.Lang == lang {
			name = t.Name
			break
		}
	}

	return dto.TagResponse{
		ID:         tag.ID,
		Name:       name,
		Slug:       tag.Slug,
		VideoCount: tag.VideoCount,
	}
}

func (s *TagServiceImpl) toTagResponses(tags []models.Tag, lang string) []dto.TagResponse {
	result := make([]dto.TagResponse, 0, len(tags))
	for _, t := range tags {
		result = append(result, s.toTagResponse(&t, lang))
	}
	return result
}

func (s *TagServiceImpl) toTagDetailResponse(tag *models.Tag, lang string) *dto.TagDetailResponse {
	name := tag.Name
	translations := make(map[string]string)

	for _, t := range tag.Translations {
		translations[t.Lang] = t.Name
		if t.Lang == lang {
			name = t.Name
		}
	}

	return &dto.TagDetailResponse{
		ID:           tag.ID,
		Name:         name,
		Slug:         tag.Slug,
		VideoCount:   tag.VideoCount,
		Translations: translations,
		CreatedAt:    tag.CreatedAt,
	}
}
