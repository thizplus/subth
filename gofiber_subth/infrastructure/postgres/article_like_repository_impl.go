package postgres

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/pkg/logger"
)

type ArticleLikeRepositoryImpl struct {
	db *gorm.DB
}

func NewArticleLikeRepository(db *gorm.DB) repositories.ArticleLikeRepository {
	return &ArticleLikeRepositoryImpl{db: db}
}

func (r *ArticleLikeRepositoryImpl) Create(ctx context.Context, like *models.ArticleLike) error {
	if err := r.db.WithContext(ctx).Create(like).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to create article like", "error", err)
		return err
	}
	return nil
}

func (r *ArticleLikeRepositoryImpl) Delete(ctx context.Context, userID, articleID uuid.UUID) error {
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND article_id = ?", userID, articleID).
		Delete(&models.ArticleLike{}).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to delete article like", "error", err)
		return err
	}
	return nil
}

func (r *ArticleLikeRepositoryImpl) Exists(ctx context.Context, userID, articleID uuid.UUID) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.ArticleLike{}).
		Where("user_id = ? AND article_id = ?", userID, articleID).
		Count(&count).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to check article like existence", "error", err)
		return false, err
	}
	return count > 0, nil
}

func (r *ArticleLikeRepositoryImpl) CountByArticle(ctx context.Context, articleID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.ArticleLike{}).
		Where("article_id = ?", articleID).
		Count(&count).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count article likes", "error", err)
		return 0, err
	}
	return count, nil
}

func (r *ArticleLikeRepositoryImpl) CountByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.ArticleLike{}).
		Where("user_id = ?", userID).
		Count(&count).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count user article likes", "error", err)
		return 0, err
	}
	return count, nil
}

func (r *ArticleLikeRepositoryImpl) CheckLikedByUser(ctx context.Context, userID uuid.UUID, articleIDs []uuid.UUID) (map[uuid.UUID]bool, error) {
	result := make(map[uuid.UUID]bool)
	for _, id := range articleIDs {
		result[id] = false
	}

	if len(articleIDs) == 0 {
		return result, nil
	}

	var likes []models.ArticleLike
	if err := r.db.WithContext(ctx).
		Where("user_id = ? AND article_id IN ?", userID, articleIDs).
		Find(&likes).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to check liked articles", "error", err)
		return nil, err
	}

	for _, like := range likes {
		result[like.ArticleID] = true
	}

	return result, nil
}
