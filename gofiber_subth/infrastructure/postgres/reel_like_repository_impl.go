package postgres

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gorm.io/gorm"
)

type reelLikeRepositoryImpl struct {
	db *gorm.DB
}

func NewReelLikeRepository(db *gorm.DB) repositories.ReelLikeRepository {
	return &reelLikeRepositoryImpl{db: db}
}

func (r *reelLikeRepositoryImpl) Create(ctx context.Context, like *models.ReelLike) error {
	return r.db.WithContext(ctx).Create(like).Error
}

func (r *reelLikeRepositoryImpl) Delete(ctx context.Context, userID, reelID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("user_id = ? AND reel_id = ?", userID, reelID).
		Delete(&models.ReelLike{}).Error
}

func (r *reelLikeRepositoryImpl) Exists(ctx context.Context, userID, reelID uuid.UUID) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.ReelLike{}).
		Where("user_id = ? AND reel_id = ?", userID, reelID).
		Count(&count).Error
	return count > 0, err
}

func (r *reelLikeRepositoryImpl) GetByUserAndReel(ctx context.Context, userID, reelID uuid.UUID) (*models.ReelLike, error) {
	var like models.ReelLike
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND reel_id = ?", userID, reelID).
		First(&like).Error
	if err != nil {
		return nil, err
	}
	return &like, nil
}

func (r *reelLikeRepositoryImpl) CountByReel(ctx context.Context, reelID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.ReelLike{}).
		Where("reel_id = ?", reelID).
		Count(&count).Error
	return count, err
}

func (r *reelLikeRepositoryImpl) ListByUser(ctx context.Context, userID uuid.UUID, limit, offset int) ([]models.ReelLike, int64, error) {
	var likes []models.ReelLike
	var total int64

	// Count total
	if err := r.db.WithContext(ctx).
		Model(&models.ReelLike{}).
		Where("user_id = ?", userID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get likes with reel relation
	if err := r.db.WithContext(ctx).
		Preload("Reel").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&likes).Error; err != nil {
		return nil, 0, err
	}

	return likes, total, nil
}

func (r *reelLikeRepositoryImpl) CheckLikedByUser(ctx context.Context, userID uuid.UUID, reelIDs []uuid.UUID) (map[uuid.UUID]bool, error) {
	result := make(map[uuid.UUID]bool)

	// Initialize all as false
	for _, id := range reelIDs {
		result[id] = false
	}

	if len(reelIDs) == 0 {
		return result, nil
	}

	var likes []models.ReelLike
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND reel_id IN ?", userID, reelIDs).
		Find(&likes).Error; err != nil {
		return nil, err
	}

	// Mark liked ones as true
	for _, like := range likes {
		result[like.ReelID] = true
	}

	return result, nil
}
