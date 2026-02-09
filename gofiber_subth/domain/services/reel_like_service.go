package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type ReelLikeService interface {
	// Like a reel
	Like(ctx context.Context, userID, reelID uuid.UUID) (*dto.LikeResponse, error)

	// Unlike a reel
	Unlike(ctx context.Context, userID, reelID uuid.UUID) (*dto.LikeResponse, error)

	// Toggle like (like if not liked, unlike if liked)
	Toggle(ctx context.Context, userID, reelID uuid.UUID) (*dto.LikeResponse, error)

	// Check if user liked a reel
	IsLiked(ctx context.Context, userID, reelID uuid.UUID) (bool, error)

	// Get likes count for a reel
	GetLikesCount(ctx context.Context, reelID uuid.UUID) (int, error)

	// Check multiple reels at once (for feed)
	CheckLikedByUser(ctx context.Context, userID uuid.UUID, reelIDs []uuid.UUID) (map[uuid.UUID]bool, error)
}
