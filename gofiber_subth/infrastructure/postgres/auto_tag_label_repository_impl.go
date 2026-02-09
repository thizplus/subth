package postgres

import (
	"context"

	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type autoTagLabelRepositoryImpl struct {
	db *gorm.DB
}

func NewAutoTagLabelRepository(db *gorm.DB) repositories.AutoTagLabelRepository {
	return &autoTagLabelRepositoryImpl{db: db}
}

func (r *autoTagLabelRepositoryImpl) GetAll(ctx context.Context) ([]models.AutoTagLabel, error) {
	var labels []models.AutoTagLabel
	err := r.db.WithContext(ctx).Order("category, key").Find(&labels).Error
	return labels, err
}

func (r *autoTagLabelRepositoryImpl) GetByKey(ctx context.Context, key string) (*models.AutoTagLabel, error) {
	var label models.AutoTagLabel
	err := r.db.WithContext(ctx).First(&label, "key = ?", key).Error
	if err != nil {
		return nil, err
	}
	return &label, nil
}

func (r *autoTagLabelRepositoryImpl) GetByKeys(ctx context.Context, keys []string) ([]models.AutoTagLabel, error) {
	var labels []models.AutoTagLabel
	err := r.db.WithContext(ctx).Where("key IN ?", keys).Find(&labels).Error
	return labels, err
}

func (r *autoTagLabelRepositoryImpl) GetByCategory(ctx context.Context, category string) ([]models.AutoTagLabel, error) {
	var labels []models.AutoTagLabel
	err := r.db.WithContext(ctx).Where("category = ?", category).Order("key").Find(&labels).Error
	return labels, err
}
