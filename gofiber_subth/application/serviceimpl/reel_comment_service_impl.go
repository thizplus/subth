package serviceimpl

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/models"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
	"gorm.io/gorm"
)

type reelCommentServiceImpl struct {
	commentRepo repositories.ReelCommentRepository
	reelRepo    repositories.ReelRepository
}

func NewReelCommentService(
	commentRepo repositories.ReelCommentRepository,
	reelRepo repositories.ReelRepository,
) services.ReelCommentService {
	return &reelCommentServiceImpl{
		commentRepo: commentRepo,
		reelRepo:    reelRepo,
	}
}

func (s *reelCommentServiceImpl) Create(ctx context.Context, userID uuid.UUID, req *dto.CreateCommentRequest) (*dto.CommentResponse, error) {
	comment := &models.ReelComment{
		UserID:   userID,
		ReelID:   req.ReelID,
		ParentID: req.ParentID,
		Content:  req.Content,
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		logger.ErrorContext(ctx, "Failed to create comment", "error", err)
		return nil, err
	}

	// Update reel comments count
	if err := s.updateReelCommentsCount(ctx, req.ReelID); err != nil {
		logger.WarnContext(ctx, "Failed to update reel comments count", "error", err)
	}

	// Get the created comment with user info
	created, err := s.commentRepo.GetByID(ctx, comment.ID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get created comment", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "User created comment", "user_id", userID, "reel_id", req.ReelID, "comment_id", comment.ID)
	return dto.ToCommentResponse(created), nil
}

func (s *reelCommentServiceImpl) GetByID(ctx context.Context, id uuid.UUID) (*dto.CommentResponse, error) {
	comment, err := s.commentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return dto.ToCommentResponse(comment), nil
}

func (s *reelCommentServiceImpl) Update(ctx context.Context, userID, commentID uuid.UUID, req *dto.UpdateCommentRequest) (*dto.CommentResponse, error) {
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("comment not found")
		}
		logger.ErrorContext(ctx, "Failed to get comment", "error", err)
		return nil, err
	}

	// Check ownership
	if comment.UserID != userID {
		return nil, errors.New("unauthorized: not comment owner")
	}

	comment.Content = req.Content
	if err := s.commentRepo.Update(ctx, comment); err != nil {
		logger.ErrorContext(ctx, "Failed to update comment", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "User updated comment", "user_id", userID, "comment_id", commentID)
	return dto.ToCommentResponse(comment), nil
}

func (s *reelCommentServiceImpl) Delete(ctx context.Context, userID, commentID uuid.UUID) error {
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("comment not found")
		}
		logger.ErrorContext(ctx, "Failed to get comment", "error", err)
		return err
	}

	// Check ownership
	if comment.UserID != userID {
		return errors.New("unauthorized: not comment owner")
	}

	reelID := comment.ReelID

	if err := s.commentRepo.Delete(ctx, commentID); err != nil {
		logger.ErrorContext(ctx, "Failed to delete comment", "error", err)
		return err
	}

	// Update reel comments count
	if err := s.updateReelCommentsCount(ctx, reelID); err != nil {
		logger.WarnContext(ctx, "Failed to update reel comments count", "error", err)
	}

	logger.InfoContext(ctx, "User deleted comment", "user_id", userID, "comment_id", commentID)
	return nil
}

func (s *reelCommentServiceImpl) ListByReel(ctx context.Context, reelID uuid.UUID, page, limit int) ([]dto.CommentResponse, int64, error) {
	offset := (page - 1) * limit
	comments, total, err := s.commentRepo.ListByReel(ctx, reelID, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list comments", "error", err)
		return nil, 0, err
	}

	return dto.ToCommentResponseList(comments), total, nil
}

func (s *reelCommentServiceImpl) ListReplies(ctx context.Context, parentID uuid.UUID, page, limit int) ([]dto.CommentResponse, int64, error) {
	offset := (page - 1) * limit
	replies, total, err := s.commentRepo.ListReplies(ctx, parentID, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list replies", "error", err)
		return nil, 0, err
	}

	return dto.ToCommentResponseList(replies), total, nil
}

func (s *reelCommentServiceImpl) GetCommentsCount(ctx context.Context, reelID uuid.UUID) (int, error) {
	count, err := s.commentRepo.CountByReel(ctx, reelID)
	return int(count), err
}

// updateReelCommentsCount updates the cached comments count on the reel
func (s *reelCommentServiceImpl) updateReelCommentsCount(ctx context.Context, reelID uuid.UUID) error {
	count, err := s.commentRepo.CountByReel(ctx, reelID)
	if err != nil {
		return err
	}

	reel, err := s.reelRepo.GetByID(ctx, reelID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}

	reel.CommentsCount = int(count)
	return s.reelRepo.Update(ctx, reel)
}
