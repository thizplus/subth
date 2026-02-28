package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ArticleCommentRepository interface {
	Create(ctx context.Context, comment *models.ArticleComment) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.ArticleComment, error)
	Update(ctx context.Context, comment *models.ArticleComment) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListByArticle(ctx context.Context, articleID uuid.UUID, limit, offset int) ([]models.ArticleComment, int64, error)
	ListReplies(ctx context.Context, parentID uuid.UUID, limit, offset int) ([]models.ArticleComment, int64, error)
	CountByArticle(ctx context.Context, articleID uuid.UUID) (int64, error)
	CountByUser(ctx context.Context, userID uuid.UUID) (int64, error)
	ListRecent(ctx context.Context, limit int) ([]models.ArticleComment, error)
}
