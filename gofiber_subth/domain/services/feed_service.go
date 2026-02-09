package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type FeedService interface {
	// GetFeed returns videos with reels for the home feed (cover images)
	// userID is optional - if provided, includes isLiked status
	GetFeed(ctx context.Context, page int, limit int, lang string, userID *uuid.UUID) ([]dto.FeedItemResponse, int64, error)

	// GetReels returns videos with reels for the reels page (video player)
	// userID is optional - if provided, includes isLiked status
	GetReels(ctx context.Context, page int, limit int, lang string, userID *uuid.UUID) ([]dto.ReelItemResponse, int64, error)
}
