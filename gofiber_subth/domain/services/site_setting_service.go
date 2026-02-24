package services

import (
	"context"

	"gofiber-template/domain/dto"
)

type SiteSettingService interface {
	// Get returns the current site settings
	Get(ctx context.Context) (*dto.SiteSettingResponse, error)
	// Update updates the site settings
	Update(ctx context.Context, req *dto.UpdateSiteSettingRequest) (*dto.SiteSettingResponse, error)
}
