package serviceimpl

import (
	"context"

	"gofiber-template/domain/dto"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type SiteSettingServiceImpl struct {
	repo repositories.SiteSettingRepository
}

func NewSiteSettingService(repo repositories.SiteSettingRepository) services.SiteSettingService {
	return &SiteSettingServiceImpl{repo: repo}
}

func (s *SiteSettingServiceImpl) Get(ctx context.Context) (*dto.SiteSettingResponse, error) {
	setting, err := s.repo.Get(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get site settings", "error", err)
		return nil, err
	}

	return dto.SiteSettingToResponse(setting), nil
}

func (s *SiteSettingServiceImpl) Update(ctx context.Context, req *dto.UpdateSiteSettingRequest) (*dto.SiteSettingResponse, error) {
	// Get existing setting
	setting, err := s.repo.Get(ctx)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get site settings for update", "error", err)
		return nil, err
	}

	// Update fields
	setting.GTMID = req.GTMID

	// Save
	if err := s.repo.Update(ctx, setting); err != nil {
		logger.ErrorContext(ctx, "Failed to update site settings", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "Site settings updated", "gtm_id", setting.GTMID)
	return dto.SiteSettingToResponse(setting), nil
}
