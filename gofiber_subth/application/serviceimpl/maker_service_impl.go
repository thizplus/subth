package serviceimpl

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type MakerServiceImpl struct {
	makerRepo repositories.MakerRepository
}

func NewMakerService(makerRepo repositories.MakerRepository) services.MakerService {
	return &MakerServiceImpl{
		makerRepo: makerRepo,
	}
}

func (s *MakerServiceImpl) CreateMaker(ctx context.Context, req *dto.CreateMakerRequest) (*dto.MakerDetailResponse, error) {
	// ตรวจสอบว่ามี maker ชื่อนี้แล้วหรือไม่
	existing, _ := s.makerRepo.GetByName(ctx, req.Name)
	if existing != nil {
		logger.WarnContext(ctx, "Maker already exists", "name", req.Name)
		return nil, errors.New("maker already exists")
	}

	maker := &models.Maker{
		Name: req.Name,
		Slug: slug.Make(req.Name),
	}

	if err := s.makerRepo.Create(ctx, maker); err != nil {
		logger.ErrorContext(ctx, "Failed to create maker", "name", req.Name, "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Maker created", "maker_id", maker.ID, "name", maker.Name)

	return &dto.MakerDetailResponse{
		ID:         maker.ID,
		Name:       maker.Name,
		Slug:       maker.Slug,
		VideoCount: maker.VideoCount,
		CreatedAt:  maker.CreatedAt,
	}, nil
}

func (s *MakerServiceImpl) UpdateMaker(ctx context.Context, id uuid.UUID, req *dto.UpdateMakerRequest) (*dto.MakerDetailResponse, error) {
	maker, err := s.makerRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("maker not found")
		}
		logger.ErrorContext(ctx, "Failed to get maker for update", "maker_id", id, "error", err)
		return nil, err
	}

	// Update fields ถ้ามีส่งมา
	if req.Name != nil && *req.Name != maker.Name {
		// ตรวจสอบว่าชื่อใหม่ไม่ซ้ำกับ maker อื่น
		existing, _ := s.makerRepo.GetByName(ctx, *req.Name)
		if existing != nil && existing.ID != id {
			logger.WarnContext(ctx, "Maker name already exists", "name", *req.Name)
			return nil, errors.New("maker name already exists")
		}
		maker.Name = *req.Name
		maker.Slug = slug.Make(*req.Name)
	}

	if err := s.makerRepo.Update(ctx, maker); err != nil {
		logger.ErrorContext(ctx, "Failed to update maker", "maker_id", id, "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Maker updated", "maker_id", id)

	return &dto.MakerDetailResponse{
		ID:         maker.ID,
		Name:       maker.Name,
		Slug:       maker.Slug,
		VideoCount: maker.VideoCount,
		CreatedAt:  maker.CreatedAt,
	}, nil
}

func (s *MakerServiceImpl) DeleteMaker(ctx context.Context, id uuid.UUID) error {
	// ตรวจสอบว่ามี maker นี้อยู่หรือไม่
	maker, err := s.makerRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("maker not found")
		}
		logger.ErrorContext(ctx, "Failed to get maker for delete", "maker_id", id, "error", err)
		return err
	}

	// ตรวจสอบว่ามี video ที่ใช้ maker นี้อยู่หรือไม่
	if maker.VideoCount > 0 {
		logger.WarnContext(ctx, "Cannot delete maker with videos", "maker_id", id, "video_count", maker.VideoCount)
		return errors.New("cannot delete maker with associated videos")
	}

	if err := s.makerRepo.Delete(ctx, id); err != nil {
		logger.ErrorContext(ctx, "Failed to delete maker", "maker_id", id, "error", err)
		return err
	}

	logger.InfoContext(ctx, "Maker deleted", "maker_id", id)
	return nil
}

func (s *MakerServiceImpl) GetMaker(ctx context.Context, id uuid.UUID) (*dto.MakerDetailResponse, error) {
	maker, err := s.makerRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("maker not found")
		}
		logger.ErrorContext(ctx, "Failed to get maker", "maker_id", id, "error", err)
		return nil, err
	}

	return &dto.MakerDetailResponse{
		ID:         maker.ID,
		Name:       maker.Name,
		Slug:       maker.Slug,
		VideoCount: maker.VideoCount,
		CreatedAt:  maker.CreatedAt,
	}, nil
}

func (s *MakerServiceImpl) GetMakerBySlug(ctx context.Context, slug string) (*dto.MakerDetailResponse, error) {
	maker, err := s.makerRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("maker not found")
		}
		logger.ErrorContext(ctx, "Failed to get maker by slug", "slug", slug, "error", err)
		return nil, err
	}

	return &dto.MakerDetailResponse{
		ID:         maker.ID,
		Name:       maker.Name,
		Slug:       maker.Slug,
		VideoCount: maker.VideoCount,
		CreatedAt:  maker.CreatedAt,
	}, nil
}

func (s *MakerServiceImpl) ListMakers(ctx context.Context, req *dto.MakerListRequest) ([]dto.MakerResponse, int64, error) {
	params := repositories.MakerListParams{
		Limit:       req.Limit,
		Offset:      (req.Page - 1) * req.Limit,
		Search:      req.Search,
		SortBy:      req.SortBy,
		Order:       req.Order,
		HasArticles: req.HasArticles,
	}

	makers, total, err := s.makerRepo.List(ctx, params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list makers", "error", err)
		return nil, 0, err
	}

	result := make([]dto.MakerResponse, 0, len(makers))
	for _, m := range makers {
		result = append(result, dto.MakerResponse{
			ID:         m.ID,
			Name:       m.Name,
			Slug:       m.Slug,
			VideoCount: m.VideoCount,
		})
	}

	return result, total, nil
}

func (s *MakerServiceImpl) SearchMakers(ctx context.Context, query string, limit int) ([]dto.MakerResponse, error) {
	makers, err := s.makerRepo.Search(ctx, query, limit)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to search makers", "query", query, "error", err)
		return nil, err
	}

	result := make([]dto.MakerResponse, 0, len(makers))
	for _, m := range makers {
		result = append(result, dto.MakerResponse{
			ID:         m.ID,
			Name:       m.Name,
			Slug:       m.Slug,
			VideoCount: m.VideoCount,
		})
	}

	return result, nil
}

func (s *MakerServiceImpl) GetTopMakers(ctx context.Context, limit int) ([]dto.MakerResponse, error) {
	params := repositories.MakerListParams{
		Limit:  limit,
		Offset: 0,
		SortBy: "video_count",
		Order:  "desc",
	}

	makers, _, err := s.makerRepo.List(ctx, params)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get top makers", "error", err)
		return nil, err
	}

	result := make([]dto.MakerResponse, 0, len(makers))
	for _, m := range makers {
		result = append(result, dto.MakerResponse{
			ID:         m.ID,
			Name:       m.Name,
			Slug:       m.Slug,
			VideoCount: m.VideoCount,
		})
	}

	return result, nil
}
