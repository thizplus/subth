package postgres

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/pkg/logger"
)

type ArticleCommentRepositoryImpl struct {
	db *gorm.DB
}

func NewArticleCommentRepository(db *gorm.DB) repositories.ArticleCommentRepository {
	return &ArticleCommentRepositoryImpl{db: db}
}

func (r *ArticleCommentRepositoryImpl) Create(ctx context.Context, comment *models.ArticleComment) error {
	if err := r.db.WithContext(ctx).Create(comment).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to create article comment", "error", err)
		return err
	}
	return nil
}

func (r *ArticleCommentRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*models.ArticleComment, error) {
	var comment models.ArticleComment
	if err := r.db.WithContext(ctx).
		Preload("User").
		First(&comment, id).Error; err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *ArticleCommentRepositoryImpl) Update(ctx context.Context, comment *models.ArticleComment) error {
	if err := r.db.WithContext(ctx).Save(comment).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to update article comment", "error", err)
		return err
	}
	return nil
}

func (r *ArticleCommentRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&models.ArticleComment{}, id).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to delete article comment", "error", err)
		return err
	}
	return nil
}

func (r *ArticleCommentRepositoryImpl) ListByArticle(ctx context.Context, articleID uuid.UUID, limit, offset int) ([]models.ArticleComment, int64, error) {
	var comments []models.ArticleComment
	var total int64

	// Count total (top-level only)
	if err := r.db.WithContext(ctx).Model(&models.ArticleComment{}).
		Where("article_id = ? AND parent_id IS NULL", articleID).
		Count(&total).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count article comments", "error", err)
		return nil, 0, err
	}

	// Get comments (top-level only, sorted by newest)
	if err := r.db.WithContext(ctx).
		Preload("User").
		Where("article_id = ? AND parent_id IS NULL", articleID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to list article comments", "error", err)
		return nil, 0, err
	}

	return comments, total, nil
}

func (r *ArticleCommentRepositoryImpl) ListReplies(ctx context.Context, parentID uuid.UUID, limit, offset int) ([]models.ArticleComment, int64, error) {
	var replies []models.ArticleComment
	var total int64

	if err := r.db.WithContext(ctx).Model(&models.ArticleComment{}).
		Where("parent_id = ?", parentID).
		Count(&total).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count replies", "error", err)
		return nil, 0, err
	}

	if err := r.db.WithContext(ctx).
		Preload("User").
		Where("parent_id = ?", parentID).
		Order("created_at ASC").
		Limit(limit).
		Offset(offset).
		Find(&replies).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to list replies", "error", err)
		return nil, 0, err
	}

	return replies, total, nil
}

func (r *ArticleCommentRepositoryImpl) CountByArticle(ctx context.Context, articleID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.ArticleComment{}).
		Where("article_id = ?", articleID).
		Count(&count).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count article comments", "error", err)
		return 0, err
	}
	return count, nil
}

func (r *ArticleCommentRepositoryImpl) CountByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&models.ArticleComment{}).
		Where("user_id = ?", userID).
		Count(&count).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to count user article comments", "error", err)
		return 0, err
	}
	return count, nil
}

func (r *ArticleCommentRepositoryImpl) ListRecent(ctx context.Context, limit int) ([]models.ArticleComment, error) {
	var comments []models.ArticleComment
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Article").
		Order("created_at DESC").
		Limit(limit).
		Find(&comments).Error; err != nil {
		logger.ErrorContext(ctx, "Failed to list recent article comments", "error", err)
		return nil, err
	}
	return comments, nil
}
