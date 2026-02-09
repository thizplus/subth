package serviceimpl

import (
	"context"

	"gorm.io/gorm"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type StatsServiceImpl struct {
	db          *gorm.DB
	makerSvc    services.MakerService
	castSvc     services.CastService
	tagSvc      services.TagService
}

func NewStatsService(db *gorm.DB, makerSvc services.MakerService, castSvc services.CastService, tagSvc services.TagService) services.StatsService {
	return &StatsServiceImpl{
		db:       db,
		makerSvc: makerSvc,
		castSvc:  castSvc,
		tagSvc:   tagSvc,
	}
}

func (s *StatsServiceImpl) GetStats(ctx context.Context) (*services.StatsResponse, error) {
	var videoCount, makerCount, castCount, tagCount int64

	if err := s.db.WithContext(ctx).Model(&models.Video{}).Count(&videoCount).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count videos", "error", err)
		return nil, err
	}

	if err := s.db.WithContext(ctx).Model(&models.Maker{}).Count(&makerCount).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count makers", "error", err)
		return nil, err
	}

	if err := s.db.WithContext(ctx).Model(&models.Cast{}).Count(&castCount).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count casts", "error", err)
		return nil, err
	}

	if err := s.db.WithContext(ctx).Model(&models.Tag{}).Count(&tagCount).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count tags", "error", err)
		return nil, err
	}

	return &services.StatsResponse{
		TotalVideos: videoCount,
		TotalMakers: makerCount,
		TotalCasts:  castCount,
		TotalTags:   tagCount,
	}, nil
}

func (s *StatsServiceImpl) GetTopMakers(ctx context.Context, limit int) ([]dto.MakerResponse, error) {
	return s.makerSvc.GetTopMakers(ctx, limit)
}

func (s *StatsServiceImpl) GetTopCasts(ctx context.Context, limit int, lang string) ([]dto.CastResponse, error) {
	return s.castSvc.GetTopCasts(ctx, limit, lang)
}

func (s *StatsServiceImpl) GetTopTags(ctx context.Context, limit int, lang string) ([]dto.TagResponse, error) {
	return s.tagSvc.GetTopTags(ctx, limit, lang)
}
