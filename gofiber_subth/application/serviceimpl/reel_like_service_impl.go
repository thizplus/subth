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

type reelLikeServiceImpl struct {
	likeRepo repositories.ReelLikeRepository
	reelRepo repositories.ReelRepository
}

func NewReelLikeService(
	likeRepo repositories.ReelLikeRepository,
	reelRepo repositories.ReelRepository,
) services.ReelLikeService {
	return &reelLikeServiceImpl{
		likeRepo: likeRepo,
		reelRepo: reelRepo,
	}
}

func (s *reelLikeServiceImpl) Like(ctx context.Context, userID, reelID uuid.UUID) (*dto.LikeResponse, error) {
	// Check if already liked
	exists, err := s.likeRepo.Exists(ctx, userID, reelID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check like existence", "error", err)
		return nil, err
	}

	if exists {
		// Already liked, return current state
		count, _ := s.likeRepo.CountByReel(ctx, reelID)
		return &dto.LikeResponse{
			IsLiked:    true,
			LikesCount: int(count),
		}, nil
	}

	// Create like
	like := &models.ReelLike{
		UserID: userID,
		ReelID: reelID,
	}

	if err := s.likeRepo.Create(ctx, like); err != nil {
		logger.ErrorContext(ctx, "Failed to create like", "error", err)
		return nil, err
	}

	// Update reel likes count
	if err := s.updateReelLikesCount(ctx, reelID); err != nil {
		logger.WarnContext(ctx, "Failed to update reel likes count", "error", err)
	}

	count, _ := s.likeRepo.CountByReel(ctx, reelID)
	logger.InfoContext(ctx, "User liked reel", "user_id", userID, "reel_id", reelID)

	return &dto.LikeResponse{
		IsLiked:    true,
		LikesCount: int(count),
	}, nil
}

func (s *reelLikeServiceImpl) Unlike(ctx context.Context, userID, reelID uuid.UUID) (*dto.LikeResponse, error) {
	// Check if liked
	exists, err := s.likeRepo.Exists(ctx, userID, reelID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check like existence", "error", err)
		return nil, err
	}

	if !exists {
		// Not liked, return current state
		count, _ := s.likeRepo.CountByReel(ctx, reelID)
		return &dto.LikeResponse{
			IsLiked:    false,
			LikesCount: int(count),
		}, nil
	}

	// Delete like
	if err := s.likeRepo.Delete(ctx, userID, reelID); err != nil {
		logger.ErrorContext(ctx, "Failed to delete like", "error", err)
		return nil, err
	}

	// Update reel likes count
	if err := s.updateReelLikesCount(ctx, reelID); err != nil {
		logger.WarnContext(ctx, "Failed to update reel likes count", "error", err)
	}

	count, _ := s.likeRepo.CountByReel(ctx, reelID)
	logger.InfoContext(ctx, "User unliked reel", "user_id", userID, "reel_id", reelID)

	return &dto.LikeResponse{
		IsLiked:    false,
		LikesCount: int(count),
	}, nil
}

func (s *reelLikeServiceImpl) Toggle(ctx context.Context, userID, reelID uuid.UUID) (*dto.LikeResponse, error) {
	exists, err := s.likeRepo.Exists(ctx, userID, reelID)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to check like existence", "error", err)
		return nil, err
	}

	if exists {
		return s.Unlike(ctx, userID, reelID)
	}
	return s.Like(ctx, userID, reelID)
}

func (s *reelLikeServiceImpl) IsLiked(ctx context.Context, userID, reelID uuid.UUID) (bool, error) {
	return s.likeRepo.Exists(ctx, userID, reelID)
}

func (s *reelLikeServiceImpl) GetLikesCount(ctx context.Context, reelID uuid.UUID) (int, error) {
	count, err := s.likeRepo.CountByReel(ctx, reelID)
	return int(count), err
}

func (s *reelLikeServiceImpl) CheckLikedByUser(ctx context.Context, userID uuid.UUID, reelIDs []uuid.UUID) (map[uuid.UUID]bool, error) {
	return s.likeRepo.CheckLikedByUser(ctx, userID, reelIDs)
}

// updateReelLikesCount updates the cached likes count on the reel
func (s *reelLikeServiceImpl) updateReelLikesCount(ctx context.Context, reelID uuid.UUID) error {
	count, err := s.likeRepo.CountByReel(ctx, reelID)
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

	reel.LikesCount = int(count)
	return s.reelRepo.Update(ctx, reel)
}
