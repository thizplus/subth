package postgres

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gorm.io/gorm"
)

type reelRepositoryImpl struct {
	db *gorm.DB
}

func NewReelRepository(db *gorm.DB) repositories.ReelRepository {
	return &reelRepositoryImpl{db: db}
}

func (r *reelRepositoryImpl) Create(ctx context.Context, reel *models.Reel) error {
	return r.db.WithContext(ctx).Create(reel).Error
}

func (r *reelRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.Reel, error) {
	var reel models.Reel
	err := r.db.WithContext(ctx).
		Preload("Video").
		Preload("Video.Tags").
		Preload("Video.Tags.Translations").
		First(&reel, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &reel, nil
}

func (r *reelRepositoryImpl) Update(ctx context.Context, reel *models.Reel) error {
	return r.db.WithContext(ctx).Save(reel).Error
}

func (r *reelRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Reel{}, "id = ?", id).Error
}

func (r *reelRepositoryImpl) List(ctx context.Context, limit int, offset int, activeOnly bool) ([]models.Reel, int64, error) {
	var reels []models.Reel
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Reel{})

	if activeOnly {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&reels).Error

	return reels, total, err
}

func (r *reelRepositoryImpl) GetByVideoID(ctx context.Context, videoID uuid.UUID) (*models.Reel, error) {
	var reel models.Reel
	err := r.db.WithContext(ctx).
		Where("video_id = ?", videoID).
		First(&reel).Error
	if err != nil {
		return nil, err
	}
	return &reel, nil
}

func (r *reelRepositoryImpl) ListWithVideo(ctx context.Context, limit int, offset int, activeOnly bool) ([]models.Reel, int64, error) {
	var reels []models.Reel
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Reel{})

	if activeOnly {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Preload("Video").
		Preload("Video.Tags").
		Preload("Video.Tags.Translations").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&reels).Error

	return reels, total, err
}
