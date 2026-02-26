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

type CastServiceImpl struct {
	castRepo repositories.CastRepository
}

func NewCastService(castRepo repositories.CastRepository) services.CastService {
	return &CastServiceImpl{
		castRepo: castRepo,
	}
}

func (s *CastServiceImpl) CreateCast(ctx context.Context, req *dto.CreateCastRequest) (*dto.CastDetailResponse, error) {
	// ตรวจสอบว่ามี cast ชื่อนี้แล้วหรือไม่
	existing, _ := s.castRepo.GetByName(ctx, req.Name)
	if existing != nil {
		logger.WarnContext(ctx, "Cast already exists", "name", req.Name)
		return nil, errors.New("cast already exists")
	}

	cast := &models.Cast{
		Name: req.Name,
		Slug: slug.Make(req.Name),
	}

	if err := s.castRepo.Create(ctx, cast); err != nil {
		logger.ErrorContext(ctx, "Failed to create cast", "name", req.Name, "error", err)
		return nil, err
	}

	// สร้าง translations ถ้ามี
	if req.Translations != nil {
		for lang, name := range req.Translations {
			if name == "" {
				continue
			}
			trans := &models.CastTranslation{
				CastID: cast.ID,
				Lang:   lang,
				Name:   name,
			}
			if err := s.castRepo.CreateTranslation(ctx, trans); err != nil {
				logger.WarnContext(ctx, "Failed to create cast translation", "cast_id", cast.ID, "lang", lang, "error", err)
			}
		}
	}

	logger.InfoContext(ctx, "Cast created", "cast_id", cast.ID, "name", cast.Name)

	// ดึง cast พร้อม translations
	return s.GetCast(ctx, cast.ID, "en")
}

func (s *CastServiceImpl) UpdateCast(ctx context.Context, id uuid.UUID, req *dto.UpdateCastRequest) (*dto.CastDetailResponse, error) {
	cast, err := s.castRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cast not found")
		}
		logger.ErrorContext(ctx, "Failed to get cast for update", "cast_id", id, "error", err)
		return nil, err
	}

	// Update name ถ้ามีส่งมา
	if req.Name != nil && *req.Name != cast.Name {
		// ตรวจสอบว่าชื่อใหม่ไม่ซ้ำกับ cast อื่น
		existing, _ := s.castRepo.GetByName(ctx, *req.Name)
		if existing != nil && existing.ID != id {
			logger.WarnContext(ctx, "Cast name already exists", "name", *req.Name)
			return nil, errors.New("cast name already exists")
		}
		cast.Name = *req.Name
		cast.Slug = slug.Make(*req.Name)
	}

	if err := s.castRepo.Update(ctx, cast); err != nil {
		logger.ErrorContext(ctx, "Failed to update cast", "cast_id", id, "error", err)
		return nil, err
	}

	// Update translations ถ้ามีส่งมา (ลบทั้งหมดแล้วสร้างใหม่)
	if req.Translations != nil {
		// ลบ translations เดิมทั้งหมด
		if err := s.castRepo.DeleteTranslationsByCastID(ctx, id); err != nil {
			logger.WarnContext(ctx, "Failed to delete cast translations", "cast_id", id, "error", err)
		}

		// สร้าง translations ใหม่
		for lang, name := range req.Translations {
			if name == "" {
				continue
			}
			trans := &models.CastTranslation{
				CastID: cast.ID,
				Lang:   lang,
				Name:   name,
			}
			if err := s.castRepo.CreateTranslation(ctx, trans); err != nil {
				logger.WarnContext(ctx, "Failed to create cast translation", "cast_id", id, "lang", lang, "error", err)
			}
		}
	}

	logger.InfoContext(ctx, "Cast updated", "cast_id", id)

	// ดึง cast พร้อม translations
	return s.GetCast(ctx, cast.ID, "en")
}

func (s *CastServiceImpl) DeleteCast(ctx context.Context, id uuid.UUID) error {
	// ตรวจสอบว่ามี cast นี้อยู่หรือไม่
	cast, err := s.castRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("cast not found")
		}
		logger.ErrorContext(ctx, "Failed to get cast for delete", "cast_id", id, "error", err)
		return err
	}

	// ตรวจสอบว่ามี video ที่ใช้ cast นี้อยู่หรือไม่
	if cast.VideoCount > 0 {
		logger.WarnContext(ctx, "Cannot delete cast with videos", "cast_id", id, "video_count", cast.VideoCount)
		return errors.New("cannot delete cast with associated videos")
	}

	// ลบ translations ก่อน
	if err := s.castRepo.DeleteTranslationsByCastID(ctx, id); err != nil {
		logger.WarnContext(ctx, "Failed to delete cast translations", "cast_id", id, "error", err)
	}

	if err := s.castRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete cast", "cast_id", id, "error", err)
		return err
	}

	logger.InfoContext(ctx, "Cast deleted", "cast_id", id)
	return nil
}

func (s *CastServiceImpl) GetCast(ctx context.Context, id uuid.UUID, lang string) (*dto.CastDetailResponse, error) {
	cast, err := s.castRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cast not found")
		}
		logger.ErrorContext(ctx, "Failed to get cast", "cast_id", id, "error", err)
		return nil, err
	}

	return s.toCastDetailResponse(cast, lang), nil
}

func (s *CastServiceImpl) GetCastBySlug(ctx context.Context, slug string, lang string) (*dto.CastDetailResponse, error) {
	cast, err := s.castRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("cast not found")
		}
		logger.ErrorContext(ctx, "Failed to get cast by slug", "slug", slug, "error", err)
		return nil, err
	}

	return s.toCastDetailResponse(cast, lang), nil
}

func (s *CastServiceImpl) ListCasts(ctx context.Context, req *dto.CastListRequest) ([]dto.CastResponse, int64, error) {
	params := repositories.CastListParams{
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

	casts, total, err := s.castRepo.List(ctx, params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list casts", "error", err)
		return nil, 0, err
	}

	return s.toCastResponses(casts, req.Lang), total, nil
}

func (s *CastServiceImpl) SearchCasts(ctx context.Context, query string, lang string, limit int) ([]dto.CastResponse, error) {
	casts, err := s.castRepo.Search(ctx, query, lang, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search casts", "query", query, "error", err)
		return nil, err
	}

	return s.toCastResponses(casts, lang), nil
}

func (s *CastServiceImpl) GetTopCasts(ctx context.Context, limit int, lang string) ([]dto.CastResponse, error) {
	params := repositories.CastListParams{
		Limit:  limit,
		Offset: 0,
		Lang:   lang,
		SortBy: "video_count",
		Order:  "desc",
	}

	casts, _, err := s.castRepo.List(ctx, params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top casts", "error", err)
		return nil, err
	}

	return s.toCastResponses(casts, lang), nil
}

// Helper functions

func (s *CastServiceImpl) toCastResponse(cast *models.Cast, lang string) dto.CastResponse {
	name := cast.Name
	for _, t := range cast.Translations {
		if t.Lang == lang {
			name = t.Name
			break
		}
	}

	return dto.CastResponse{
		ID:         cast.ID,
		Name:       name,
		Slug:       cast.Slug,
		VideoCount: cast.VideoCount,
	}
}

func (s *CastServiceImpl) toCastResponses(casts []models.Cast, lang string) []dto.CastResponse {
	result := make([]dto.CastResponse, 0, len(casts))
	for _, c := range casts {
		result = append(result, s.toCastResponse(&c, lang))
	}
	return result
}

func (s *CastServiceImpl) toCastDetailResponse(cast *models.Cast, lang string) *dto.CastDetailResponse {
	name := cast.Name
	translations := make(map[string]string)

	for _, t := range cast.Translations {
		translations[t.Lang] = t.Name
		if t.Lang == lang {
			name = t.Name
		}
	}

	return &dto.CastDetailResponse{
		ID:           cast.ID,
		Name:         name,
		Slug:         cast.Slug,
		VideoCount:   cast.VideoCount,
		Translations: translations,
		CreatedAt:    cast.CreatedAt,
	}
}
