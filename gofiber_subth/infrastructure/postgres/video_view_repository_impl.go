package postgres

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/pkg/logger"
	"gorm.io/gorm"
)

type videoViewRepositoryImpl struct {
	db *gorm.DB
}

func NewVideoViewRepository(db *gorm.DB) repositories.VideoViewRepository {
	return &videoViewRepositoryImpl{db: db}
}

func (r *videoViewRepositoryImpl) Create(ctx context.Context, view *models.VideoView) error {
	if err := r.db.WithContext(ctx).Create(view).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to create video view", "error", err, "user_id", view.UserID, "reel_id", view.ReelID)
		return err
	}
	return nil
}

func (r *videoViewRepositoryImpl) Update(ctx context.Context, view *models.VideoView) error {
	if err := r.db.WithContext(ctx).Save(view).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to update video view", "error", err, "id", view.ID)
		return err
	}
	return nil
}

func (r *videoViewRepositoryImpl) GetByUserAndReel(ctx context.Context, userID, reelID uuid.UUID) (*models.VideoView, error) {
	var view models.VideoView
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND reel_id = ?", userID, reelID).
		First(&view).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		logger.ErrorContext(ctx, "Failed to get video view", "error", err, "user_id", userID, "reel_id", reelID)
		return nil, err
	}
	return &view, nil
}

func (r *videoViewRepositoryImpl) HasUserViewedReel(ctx context.Context, userID, reelID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.VideoView{}).
		Where("user_id = ? AND reel_id = ? AND xp_awarded = true", userID, reelID).
		Count(&count).Error
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check if user viewed reel", "error", err, "user_id", userID, "reel_id", reelID)
		return false, err
	}
	return count > 0, nil
}

func (r *videoViewRepositoryImpl) MarkXPAwarded(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Model(&models.VideoView{}).
		Where("id = ?", id).
		Update("xp_awarded", true).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to mark XP awarded", "error", err, "id", id)
		return err
	}
	return nil
}

func (r *videoViewRepositoryImpl) CountByReel(ctx context.Context, reelID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.VideoView{}).
		Where("reel_id = ?", reelID).
		Count(&count).Error
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count views by reel", "error", err, "reel_id", reelID)
		return 0, err
	}
	return count, nil
}

func (r *videoViewRepositoryImpl) CountByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.VideoView{}).
		Where("user_id = ?", userID).
		Count(&count).Error
	if err != nil {
		logger.ErrorContext(ctx, "Failed to count views by user", "error", err, "user_id", userID)
		return 0, err
	}
	return count, nil
}
