package dto

import (
	"github.com/google/uuid"
	"gofiber-template/domain/models"
)

// LikeReelRequest - Request to like a reel
type LikeReelRequest struct {
	ReelID uuid.UUID `json:"reelId" validate:"required"`
}

// LikeResponse - Response after like/unlike
type LikeResponse struct {
	IsLiked    bool `json:"isLiked"`
	LikesCount int  `json:"likesCount"`
}

// ReelLikeResponse - Single like detail
type ReelLikeResponse struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"userId"`
	ReelID    uuid.UUID `json:"reelId"`
	CreatedAt string    `json:"createdAt"`
}

// ToReelLikeResponse converts model to response
func ToReelLikeResponse(like *models.ReelLike) *ReelLikeResponse {
	return &ReelLikeResponse{
		ID:        like.ID,
		UserID:    like.UserID,
		ReelID:    like.ReelID,
		CreatedAt: like.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
	}
}
