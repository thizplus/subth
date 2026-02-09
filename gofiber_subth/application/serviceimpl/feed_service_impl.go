package serviceimpl

import (
	"context"

	"github.com/google/uuid"
	"gofiber-template/domain/dto"
	"gofiber-template/domain/repositories"
	"gofiber-template/domain/services"
	"gofiber-template/pkg/logger"
)

type FeedServiceImpl struct {
	reelRepo    repositories.ReelRepository
	likeRepo    repositories.ReelLikeRepository
	commentRepo repositories.ReelCommentRepository
}

func NewFeedService(
	reelRepo repositories.ReelRepository,
	likeRepo repositories.ReelLikeRepository,
	commentRepo repositories.ReelCommentRepository,
) services.FeedService {
	return &FeedServiceImpl{
		reelRepo:    reelRepo,
		likeRepo:    likeRepo,
		commentRepo: commentRepo,
	}
}

// GetFeed returns reels for the home feed (cover images)
func (s *FeedServiceImpl) GetFeed(ctx context.Context, page int, limit int, lang string, userID *uuid.UUID) ([]dto.FeedItemResponse, int64, error) {
	offset := (page - 1) * limit

	reels, total, err := s.reelRepo.ListWithVideo(ctx, limit, offset, true)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get feed", "error", err)
		return nil, 0, err
	}

	// Batch check like status if user is authenticated
	var likedMap map[uuid.UUID]bool
	if userID != nil {
		reelIDs := make([]uuid.UUID, len(reels))
		for i, reel := range reels {
			reelIDs[i] = reel.ID
		}
		likedMap, _ = s.likeRepo.CheckLikedByUser(ctx, *userID, reelIDs)
	}

	items := make([]dto.FeedItemResponse, 0, len(reels))
	for _, reel := range reels {
		// Use reel's own title, or get from video if empty
		title := reel.Title
		if title == "" && reel.Video != nil {
			for _, trans := range reel.Video.Translations {
				if trans.Lang == lang {
					title = trans.Title
					break
				}
			}
			// Fallback to first translation
			if title == "" && len(reel.Video.Translations) > 0 {
				title = reel.Video.Translations[0].Title
			}
		}

		// Get tag names from video
		tags := make([]string, 0)
		if reel.Video != nil {
			for _, tag := range reel.Video.Tags {
				tagName := tag.Name
				for _, trans := range tag.Translations {
					if trans.Lang == lang {
						tagName = trans.Name
						break
					}
				}
				tags = append(tags, tagName)
			}
		}

		// Get like and comment counts
		likeCount, _ := s.likeRepo.CountByReel(ctx, reel.ID)
		commentCount, _ := s.commentRepo.CountByReel(ctx, reel.ID)

		// Check if user liked this reel
		isLiked := false
		if likedMap != nil {
			isLiked = likedMap[reel.ID]
		}

		items = append(items, dto.FeedItemResponse{
			ID:           reel.ID,
			VideoID:      reel.VideoID,
			Title:        title,
			Description:  reel.Description,
			CoverURL:     reel.CoverURL,
			Tags:         tags,
			LikeCount:    likeCount,
			CommentCount: commentCount,
			IsLiked:      isLiked,
			CreatedAt:    reel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		})
	}

	return items, total, nil
}

// GetReels returns reels for the reels page (video player)
func (s *FeedServiceImpl) GetReels(ctx context.Context, page int, limit int, lang string, userID *uuid.UUID) ([]dto.ReelItemResponse, int64, error) {
	offset := (page - 1) * limit

	reels, total, err := s.reelRepo.ListWithVideo(ctx, limit, offset, true)
	if err != nil {
		logger.ErrorContext(ctx, "Failed to get reels", "error", err)
		return nil, 0, err
	}

	// Batch check like status if user is authenticated
	var likedMap map[uuid.UUID]bool
	if userID != nil {
		reelIDs := make([]uuid.UUID, len(reels))
		for i, reel := range reels {
			reelIDs[i] = reel.ID
		}
		likedMap, _ = s.likeRepo.CheckLikedByUser(ctx, *userID, reelIDs)
	}

	items := make([]dto.ReelItemResponse, 0, len(reels))
	for _, reel := range reels {
		// Use reel's own title, or get from video if empty
		title := reel.Title
		if title == "" && reel.Video != nil {
			for _, trans := range reel.Video.Translations {
				if trans.Lang == lang {
					title = trans.Title
					break
				}
			}
			// Fallback to first translation
			if title == "" && len(reel.Video.Translations) > 0 {
				title = reel.Video.Translations[0].Title
			}
		}

		// Get tag names from video
		tags := make([]string, 0)
		if reel.Video != nil {
			for _, tag := range reel.Video.Tags {
				tagName := tag.Name
				for _, trans := range tag.Translations {
					if trans.Lang == lang {
						tagName = trans.Name
						break
					}
				}
				tags = append(tags, tagName)
			}
		}

		// Get like and comment counts
		likeCount, _ := s.likeRepo.CountByReel(ctx, reel.ID)
		commentCount, _ := s.commentRepo.CountByReel(ctx, reel.ID)

		// Check if user liked this reel
		isLiked := false
		if likedMap != nil {
			isLiked = likedMap[reel.ID]
		}

		items = append(items, dto.ReelItemResponse{
			ID:           reel.ID,
			VideoID:      reel.VideoID,
			Title:        title,
			Description:  reel.Description,
			VideoURL:     reel.VideoURL,
			ThumbURL:     reel.ThumbURL,
			Tags:         tags,
			LikeCount:    likeCount,
			CommentCount: commentCount,
			IsLiked:      isLiked,
			CreatedAt:    reel.CreatedAt.UTC().Format("2006-01-02T15:04:05Z"),
		})
	}

	return items, total, nil
}
