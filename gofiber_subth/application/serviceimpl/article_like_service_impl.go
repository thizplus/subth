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

type articleLikeServiceImpl struct {
	likeRepo      repositories.ArticleLikeRepository
	articleRepo   repositories.ArticleRepository
	userStatsRepo repositories.UserStatsRepository
}

func NewArticleLikeService(
	likeRepo repositories.ArticleLikeRepository,
	articleRepo repositories.ArticleRepository,
	userStatsRepo repositories.UserStatsRepository,
) services.ArticleLikeService {
	return &articleLikeServiceImpl{
		likeRepo:      likeRepo,
		articleRepo:   articleRepo,
		userStatsRepo: userStatsRepo,
	}
}

func (s *articleLikeServiceImpl) Like(ctx context.Context, userID, articleID uuid.UUID) (*dto.ArticleLikeResponse, error) {
	// Check if already liked
	exists, err := s.likeRepo.Exists(ctx, userID, articleID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check article like existence", "error", err)
		return nil, err
	}

	if exists {
		// Already liked, return current state
		count, _ := s.likeRepo.CountByArticle(ctx, articleID)
		return &dto.ArticleLikeResponse{
			IsLiked:    true,
			LikesCount: int(count),
		}, nil
	}

	// Create like
	like := &models.ArticleLike{
		UserID:    userID,
		ArticleID: articleID,
	}

	if err := s.likeRepo.Create(ctx, like); err != nil {
		logger.ErrorContext(ctx, "Failed to create article like", "error", err)
		return nil, err
	}

	// Update article likes count
	if err := s.updateArticleLikesCount(ctx, articleID); err != nil {
		logger.WarnContext(ctx, "Failed to update article likes count", "error", err)
	}

	// Increment user's TotalLikes
	s.incrementUserLikes(ctx, userID, 1)

	count, _ := s.likeRepo.CountByArticle(ctx, articleID)
	logger.InfoContext(ctx, "User liked article", "user_id", userID, "article_id", articleID)

	return &dto.ArticleLikeResponse{
		IsLiked:    true,
		LikesCount: int(count),
	}, nil
}

func (s *articleLikeServiceImpl) Unlike(ctx context.Context, userID, articleID uuid.UUID) (*dto.ArticleLikeResponse, error) {
	// Check if liked
	exists, err := s.likeRepo.Exists(ctx, userID, articleID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check article like existence", "error", err)
		return nil, err
	}

	if !exists {
		// Not liked, return current state
		count, _ := s.likeRepo.CountByArticle(ctx, articleID)
		return &dto.ArticleLikeResponse{
			IsLiked:    false,
			LikesCount: int(count),
		}, nil
	}

	// Delete like
	if err := s.likeRepo.Delete(ctx, userID, articleID); err != nil {
		logger.ErrorContext(ctx, "Failed to delete article like", "error", err)
		return nil, err
	}

	// Update article likes count
	if err := s.updateArticleLikesCount(ctx, articleID); err != nil {
		logger.WarnContext(ctx, "Failed to update article likes count", "error", err)
	}

	// Decrement user's TotalLikes
	s.incrementUserLikes(ctx, userID, -1)

	count, _ := s.likeRepo.CountByArticle(ctx, articleID)
	logger.InfoContext(ctx, "User unliked article", "user_id", userID, "article_id", articleID)

	return &dto.ArticleLikeResponse{
		IsLiked:    false,
		LikesCount: int(count),
	}, nil
}

func (s *articleLikeServiceImpl) Toggle(ctx context.Context, userID, articleID uuid.UUID) (*dto.ArticleLikeResponse, error) {
	exists, err := s.likeRepo.Exists(ctx, userID, articleID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check article like existence", "error", err)
		return nil, err
	}

	if exists {
		return s.Unlike(ctx, userID, articleID)
	}
	return s.Like(ctx, userID, articleID)
}

func (s *articleLikeServiceImpl) IsLiked(ctx context.Context, userID, articleID uuid.UUID) (bool, error) {
	return s.likeRepo.Exists(ctx, userID, articleID)
}

func (s *articleLikeServiceImpl) GetLikesCount(ctx context.Context, articleID uuid.UUID) (int, error) {
	count, err := s.likeRepo.CountByArticle(ctx, articleID)
	return int(count), err
}

func (s *articleLikeServiceImpl) CheckLikedByUser(ctx context.Context, userID uuid.UUID, articleIDs []uuid.UUID) (map[uuid.UUID]bool, error) {
	return s.likeRepo.CheckLikedByUser(ctx, userID, articleIDs)
}

// updateArticleLikesCount updates the cached likes count on the article
func (s *articleLikeServiceImpl) updateArticleLikesCount(ctx context.Context, articleID uuid.UUID) error {
	count, err := s.likeRepo.CountByArticle(ctx, articleID)
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

	article.LikesCount = int(count)
	return s.articleRepo.Update(ctx, article)
}

// incrementUserLikes updates user's TotalLikes (delta can be 1 or -1)
func (s *articleLikeServiceImpl) incrementUserLikes(ctx context.Context, userID uuid.UUID, delta int) {
	stats, err := s.userStatsRepo.GetByUserID(ctx, userID)
	if err != nil || stats == nil {
		return
	}

	stats.TotalLikes += delta
	if stats.TotalLikes < 0 {
		stats.TotalLikes = 0
	}

	if err := s.userStatsRepo.Update(ctx, stats); err != nil {
		logger.WarnContext(ctx, "Failed to update user likes count", "error", err, "user_id", userID)
	}
}
