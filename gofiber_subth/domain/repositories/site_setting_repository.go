package repositories

import (
	"context"

	"gofiber-template/domain/models"
)

type SiteSettingRepository interface {
	// Get returns the singleton site setting (creates default if not exists)
	Get(ctx context.Context) (*models.SiteSetting, error)
	// Update saves the site setting
	Update(ctx context.Context, setting *models.SiteSetting) error
}
