package repositories

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

type ArticleLikeRepository interface {
	Create(ctx context.Context, like *models.ArticleLike) error
	Delete(ctx context.Context, userID, articleID uuid.UUID) error
	Exists(ctx context.Context, userID, articleID uuid.UUID) (bool, error)
	CountByArticle(ctx context.Context, articleID uuid.UUID) (int64, error)
	CountByUser(ctx context.Context, userID uuid.UUID) (int64, error)
	CheckLikedByUser(ctx context.Context, userID uuid.UUID, articleIDs []uuid.UUID) (map[uuid.UUID]bool, error)
}
