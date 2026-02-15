package services

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
)

type ReelCommentService interface {
	// Create a comment
	Create(ctx context.Context, userID uuid.UUID, req *dto.CreateCommentRequest) (*dto.CommentResponse, error)

	// Get a comment by ID
	GetByID(ctx context.Context, id uuid.UUID) (*dto.CommentResponse, error)

	// Update a comment (only owner can update)
	Update(ctx context.Context, userID, commentID uuid.UUID, req *dto.UpdateCommentRequest) (*dto.CommentResponse, error)

	// Delete a comment (only owner can delete)
	Delete(ctx context.Context, userID, commentID uuid.UUID) error

	// List comments for a reel
	ListByReel(ctx context.Context, reelID uuid.UUID, page, limit int) ([]dto.CommentResponse, int64, error)

	// List replies for a comment
	ListReplies(ctx context.Context, parentID uuid.UUID, page, limit int) ([]dto.CommentResponse, int64, error)

	// Get comments count for a reel
	GetCommentsCount(ctx context.Context, reelID uuid.UUID) (int, error)

	// List recent comments across all reels (for public feed)
	ListRecent(ctx context.Context, limit int) ([]dto.CommentWithReelResponse, error)
}
