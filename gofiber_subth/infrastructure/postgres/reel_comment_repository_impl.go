package postgres

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gorm.io/gorm"
)

type reelCommentRepositoryImpl struct {
	db *gorm.DB
}

func NewReelCommentRepository(db *gorm.DB) repositories.ReelCommentRepository {
	return &reelCommentRepositoryImpl{db: db}
}

func (r *reelCommentRepositoryImpl) Create(ctx context.Context, comment *models.ReelComment) error {
	return r.db.WithContext(ctx).Create(comment).Error
}

func (r *reelCommentRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.ReelComment, error) {
	var comment models.ReelComment
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("User.Stats").
		First(&comment, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *reelCommentRepositoryImpl) Update(ctx context.Context, comment *models.ReelComment) error {
	return r.db.WithContext(ctx).Save(comment).Error
}

func (r *reelCommentRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.ReelComment{}, "id = ?", id).Error
}

func (r *reelCommentRepositoryImpl) ListByReel(ctx context.Context, reelID uuid.UUID, limit, offset int) ([]models.ReelComment, int64, error) {
	var comments []models.ReelComment
	var total int64

	// Count total (only top-level comments)
	if err := r.db.WithContext(ctx).
		Model(&models.ReelComment{}).
		Where("reel_id = ? AND parent_id IS NULL", reelID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get comments with user relation (top-level only)
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("User.Stats").
		Where("reel_id = ? AND parent_id IS NULL", reelID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error; err != nil {
		return nil, 0, err
	}

	return comments, total, nil
}

func (r *reelCommentRepositoryImpl) ListReplies(ctx context.Context, parentID uuid.UUID, limit, offset int) ([]models.ReelComment, int64, error) {
	var replies []models.ReelComment
	var total int64

	// Count total replies
	if err := r.db.WithContext(ctx).
		Model(&models.ReelComment{}).
		Where("parent_id = ?", parentID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get replies with user relation
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("User.Stats").
		Where("parent_id = ?", parentID).
		Order("created_at ASC").
		Limit(limit).
		Offset(offset).
		Find(&replies).Error; err != nil {
		return nil, 0, err
	}

	return replies, total, nil
}

func (r *reelCommentRepositoryImpl) CountByReel(ctx context.Context, reelID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.ReelComment{}).
		Where("reel_id = ?", reelID).
		Count(&count).Error
	return count, err
}
