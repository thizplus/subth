package postgres

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
)

type ContactChannelRepositoryImpl struct {
	db *gorm.DB
}

func NewContactChannelRepository(db *gorm.DB) repositories.ContactChannelRepository {
	return &ContactChannelRepositoryImpl{db: db}
}

func (r *ContactChannelRepositoryImpl) Create(ctx context.Context, channel *models.ContactChannel) error {
	return r.db.WithContext(ctx).Create(channel).Error
}

func (r *ContactChannelRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.ContactChannel, error) {
	var channel models.ContactChannel
	err := r.db.WithContext(ctx).First(&channel, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

func (r *ContactChannelRepositoryImpl) Update(ctx context.Context, channel *models.ContactChannel) error {
	return r.db.WithContext(ctx).Save(channel).Error
}

func (r *ContactChannelRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.ContactChannel{}, "id = ?", id).Error
}

func (r *ContactChannelRepositoryImpl) List(ctx context.Context, includeInactive bool) ([]*models.ContactChannel, error) {
	var channels []*models.ContactChannel
	query := r.db.WithContext(ctx).Model(&models.ContactChannel{})

	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}

	err := query.Order("sort_order ASC, created_at ASC").Find(&channels).Error
	return channels, err
}

func (r *ContactChannelRepositoryImpl) Reorder(ctx context.Context, ids []uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for i, id := range ids {
			if err := tx.Model(&models.ContactChannel{}).
				Where("id = ?", id).
				Update("sort_order", i).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *ContactChannelRepositoryImpl) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.ContactChannel{}).Count(&count).Error
	return count, err
}
