package postgres

import (
	"context"

	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type SiteSettingRepositoryImpl struct {
	db *gorm.DB
}

func NewSiteSettingRepository(db *gorm.DB) repositories.SiteSettingRepository {
	return &SiteSettingRepositoryImpl{db: db}
}

func (r *SiteSettingRepositoryImpl) Get(ctx context.Context) (*models.SiteSetting, error) {
	var setting models.SiteSetting
	err := r.db.WithContext(ctx).First(&setting).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default setting if not exists
			setting = models.SiteSetting{}
			if createErr := r.db.WithContext(ctx).Create(&setting).Error; createErr != nil {
				return nil, createErr
			}
			return &setting, nil
		}
		return nil, err
	}
	return &setting, nil
}

func (r *SiteSettingRepositoryImpl) Update(ctx context.Context, setting *models.SiteSetting) error {
	return r.db.WithContext(ctx).Save(setting).Error
}
