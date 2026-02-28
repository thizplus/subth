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

type articleCommentServiceImpl struct {
	commentRepo   repositories.ArticleCommentRepository
	articleRepo   repositories.ArticleRepository
	userStatsRepo repositories.UserStatsRepository
}

func NewArticleCommentService(
	commentRepo repositories.ArticleCommentRepository,
	articleRepo repositories.ArticleRepository,
	userStatsRepo repositories.UserStatsRepository,
) services.ArticleCommentService {
	return &articleCommentServiceImpl{
		commentRepo:   commentRepo,
		articleRepo:   articleRepo,
		userStatsRepo: userStatsRepo,
	}
}

func (s *articleCommentServiceImpl) Create(ctx context.Context, userID uuid.UUID, req *dto.CreateArticleCommentRequest) (*dto.ArticleCommentResponse, error) {
	comment := &models.ArticleComment{
		UserID:    userID,
		ArticleID: req.ArticleID,
		ParentID:  req.ParentID,
		Content:   req.Content,
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		logger.ErrorContext(ctx, "Failed to create article comment", "error", err)
		return nil, err
	}

	// Update article comments count
	if err := s.updateArticleCommentsCount(ctx, req.ArticleID); err != nil {
		logger.WarnContext(ctx, "Failed to update article comments count", "error", err)
	}

	// Increment user's TotalComments
	s.incrementUserComments(ctx, userID, 1)

	// Get the created comment with user info
	created, err := s.commentRepo.GetByID(ctx, comment.ID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get created article comment", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "User created article comment", "user_id", userID, "article_id", req.ArticleID, "comment_id", comment.ID)
	return dto.ToArticleCommentResponse(created), nil
}

func (s *articleCommentServiceImpl) GetByID(ctx context.Context, id uuid.UUID) (*dto.ArticleCommentResponse, error) {
	comment, err := s.commentRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return dto.ToArticleCommentResponse(comment), nil
}

func (s *articleCommentServiceImpl) Update(ctx context.Context, userID, commentID uuid.UUID, req *dto.UpdateArticleCommentRequest) (*dto.ArticleCommentResponse, error) {
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("comment not found")
		}
		logger.ErrorContext(ctx, "Failed to get article comment", "error", err)
		return nil, err
	}

	// Check ownership
	if comment.UserID != userID {
		return nil, errors.New("unauthorized: not comment owner")
	}

	comment.Content = req.Content
	if err := s.commentRepo.Update(ctx, comment); err != nil {
		logger.ErrorContext(ctx, "Failed to update article comment", "error", err)
		return nil, err
	}

	logger.InfoContext(ctx, "User updated article comment", "user_id", userID, "comment_id", commentID)
	return dto.ToArticleCommentResponse(comment), nil
}

func (s *articleCommentServiceImpl) Delete(ctx context.Context, userID, commentID uuid.UUID) error {
	comment, err := s.commentRepo.GetByID(ctx, commentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("comment not found")
		}
		logger.ErrorContext(ctx, "Failed to get article comment", "error", err)
		return err
	}

	// Check ownership
	if comment.UserID != userID {
		return errors.New("unauthorized: not comment owner")
	}

	articleID := comment.ArticleID

	if err := s.commentRepo.Delete(ctx, commentID); err != nil {
		logger.ErrorContext(ctx, "Failed to delete article comment", "error", err)
		return err
	}

	// Update article comments count
	if err := s.updateArticleCommentsCount(ctx, articleID); err != nil {
		logger.WarnContext(ctx, "Failed to update article comments count", "error", err)
	}

	// Decrement user's TotalComments
	s.incrementUserComments(ctx, userID, -1)

	logger.InfoContext(ctx, "User deleted article comment", "user_id", userID, "comment_id", commentID)
	return nil
}

func (s *articleCommentServiceImpl) ListByArticle(ctx context.Context, articleID uuid.UUID, page, limit int) ([]dto.ArticleCommentResponse, int64, error) {
	offset := (page - 1) * limit
	comments, total, err := s.commentRepo.ListByArticle(ctx, articleID, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list article comments", "error", err)
		return nil, 0, err
	}

	return dto.ToArticleCommentResponseList(comments), total, nil
}

func (s *articleCommentServiceImpl) ListReplies(ctx context.Context, parentID uuid.UUID, page, limit int) ([]dto.ArticleCommentResponse, int64, error) {
	offset := (page - 1) * limit
	replies, total, err := s.commentRepo.ListReplies(ctx, parentID, limit, offset)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to list article comment replies", "error", err)
		return nil, 0, err
	}

	return dto.ToArticleCommentResponseList(replies), total, nil
}

func (s *articleCommentServiceImpl) GetCommentsCount(ctx context.Context, articleID uuid.UUID) (int, error) {
	count, err := s.commentRepo.CountByArticle(ctx, articleID)
	return int(count), err
}

// updateArticleCommentsCount updates the cached comments count on the article
func (s *articleCommentServiceImpl) updateArticleCommentsCount(ctx context.Context, articleID uuid.UUID) error {
	count, err := s.commentRepo.CountByArticle(ctx, articleID)
	if err != nil {
		return err
	}

	article, err := s.articleRepo.GetByID(ctx, articleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil
		}
		return err
	}

	article.CommentsCount = int(count)
	return s.articleRepo.Update(ctx, article)
}

// incrementUserComments updates user's TotalComments (delta can be 1 or -1)
func (s *articleCommentServiceImpl) incrementUserComments(ctx context.Context, userID uuid.UUID, delta int) {
	stats, err := s.userStatsRepo.GetByUserID(ctx, userID)
	if err != nil || stats == nil {
		return
	}

	stats.TotalComments += delta
	if stats.TotalComments < 0 {
		stats.TotalComments = 0
	}

	if err := s.userStatsRepo.Update(ctx, stats); err != nil {
		logger.WarnContext(ctx, "Failed to update user comments count", "error", err, "user_id", userID)
	}
}
