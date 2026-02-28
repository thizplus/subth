package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type ArticleLikeService interface {
	Like(ctx context.Context, userID, articleID uuid.UUID) (*dto.ArticleLikeResponse, error)
	Unlike(ctx context.Context, userID, articleID uuid.UUID) (*dto.ArticleLikeResponse, error)
	Toggle(ctx context.Context, userID, articleID uuid.UUID) (*dto.ArticleLikeResponse, error)
	IsLiked(ctx context.Context, userID, articleID uuid.UUID) (bool, error)
	GetLikesCount(ctx context.Context, articleID uuid.UUID) (int, error)
	CheckLikedByUser(ctx context.Context, userID uuid.UUID, articleIDs []uuid.UUID) (map[uuid.UUID]bool, error)
}
